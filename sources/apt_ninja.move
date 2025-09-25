module apt_ninja::game {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event;

    struct Ninja has key {
        address: String,
        details: Details
    }

    struct Details has store, copy, drop {
        games: u64,
        high_score: u64,
        game_history: vector<Game>,
        ongoing_game: Game,
        is_game_active: bool,
        delegated_signer: address, // New field for delegation
    }

    struct Game has store, copy, drop {
        hits: u64,
        wrong_hits: u64,
        misses: u64,
        total_score: u64
    }

    #[event]
    struct ProfileUpdated has drop, store {
        player_address: address,
        total_games: u64,
        new_high_score: u64,
    }

    const E_PROFILE_NOT_FOUND: u64 = 0;
    const E_PROFILE_ALREADY_EXISTS: u64 = 1;
    const E_GAME_NOT_FOUND: u64 = 2;
    const E_GAME_ALREADY_IN_PROGRESS: u64 = 3;
    const E_NO_GAME_IN_PROGRESS: u64 = 4;
    const E_NOT_AUTHORIZED: u64 = 5; // New error for unauthorized access
    const E_INVALID_HIT_TYPE: u64 = 6; // New error for invalid hit type

    #[entry]
    public fun create_profile(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<Ninja>(addr), error::already_exists(E_PROFILE_ALREADY_EXISTS));

        let initial_details = Details {
            games: 0,
            high_score: 0,
            game_history: vector::empty<Game>(),
            ongoing_game: Game { hits: 0, wrong_hits: 0, misses: 0, total_score: 0 },
            is_game_active: false,
            delegated_signer: @0x0, // Initialize with null address
        };

        move_to(account, Ninja {
            address: string::utf8(b""), // This field is redundant but part of the original struct
            details: initial_details,
        });
    }

    // New function to set a delegated signer
    #[entry]
    public fun delegate_signer(account: &signer, delegated_address: address) acquires Ninja {
        let addr = signer::address_of(account);
        assert!(exists<Ninja>(addr), error::not_found(E_PROFILE_NOT_FOUND));
        let player_profile = borrow_global_mut<Ninja>(addr);
        player_profile.details.delegated_signer = delegated_address;
    }

    // Modified function to support delegated signing
    #[entry]
    public fun start_game(account: &signer, player_address: address) acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        let player_profile = borrow_global_mut<Ninja>(player_address);
        let details = &mut player_profile.details;

        // Authorization Check
        let signer_addr = signer::address_of(account);
        assert!(signer_addr == player_address || signer_addr == details.delegated_signer, E_NOT_AUTHORIZED);

        assert!(!details.is_game_active, E_GAME_ALREADY_IN_PROGRESS);

        details.ongoing_game = Game { hits: 0, wrong_hits: 0, misses: 0, total_score: 0 };
        details.is_game_active = true;
    }

    // Hit type constants for better type safety
    const HIT_TYPE_CORRECT: u8 = 0;
    const HIT_TYPE_WRONG: u8 = 1;
    const HIT_TYPE_MISS: u8 = 2;

    // Modified function to support delegated signing with improved type handling
    #[entry]
    public fun record_hit(account: &signer, player_address: address, hit_type: u8, score_change: u64) acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        let player_profile = borrow_global_mut<Ninja>(player_address);
        let details = &mut player_profile.details;

        // Authorization Check
        let signer_addr = signer::address_of(account);
        assert!(signer_addr == player_address || signer_addr == details.delegated_signer, E_NOT_AUTHORIZED);
        
        assert!(details.is_game_active, E_NO_GAME_IN_PROGRESS);
        
        // Validate hit_type parameter
        assert!(hit_type <= HIT_TYPE_MISS, error::invalid_argument(6)); // E_INVALID_HIT_TYPE = 6
        
        let game = &mut details.ongoing_game;

        // Handle different hit types with proper u64 arithmetic
        if (hit_type == HIT_TYPE_CORRECT) { // Correct hit
            game.hits = game.hits + 1u64;
            game.total_score = game.total_score + score_change;
        } else if (hit_type == HIT_TYPE_WRONG) { // Wrong hit
            game.wrong_hits = game.wrong_hits + 1u64;
            // Safe subtraction to prevent underflow
            if (game.total_score >= score_change) {
                game.total_score = game.total_score - score_change;
            } else {
                game.total_score = 0u64;
            }
        } else if (hit_type == HIT_TYPE_MISS) { // Miss
            game.misses = game.misses + 1u64;
            // Misses don't affect score, but we can optionally penalize
            // game.total_score remains unchanged for misses
        }
    }

    // Modified function to support delegated signing
    #[entry]
    public fun conclude_game(account: &signer, player_address: address) acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        let player_profile = borrow_global_mut<Ninja>(player_address);
        let details = &mut player_profile.details;

        // Authorization Check
        let signer_addr = signer::address_of(account);
        assert!(signer_addr == player_address || signer_addr == details.delegated_signer, E_NOT_AUTHORIZED);

        assert!(details.is_game_active, E_NO_GAME_IN_PROGRESS);

        let game_data = details.ongoing_game;
        details.is_game_active = false;
        
        // Note: internal_record_game needs the player's signer, not the delegate's
        // This is a complex interaction. For now, we pass the `player_address` and assume an internal function
        // can handle it. A more advanced pattern might be needed if this function tried to `move_to`.
        internal_record_game(player_address, game_data.hits, game_data.wrong_hits, game_data.misses, game_data.total_score);
    }
    
    // Internal function now takes address instead of signer
    fun internal_record_game(player_address: address, hits: u64, wrong_hits: u64, misses: u64, total_score: u64) acquires Ninja {
        let player_profile = borrow_global_mut<Ninja>(player_address);
        let details = &mut player_profile.details;

        let new_game = Game { hits, wrong_hits, misses, total_score };

        if (details.high_score < total_score) {
            details.high_score = total_score;
        };

        details.games = details.games + 1;
        vector::push_back(&mut details.game_history, new_game);

        event::emit(ProfileUpdated {
            player_address: player_address,
            total_games: details.games,
            new_high_score: details.high_score,
        });
    }

    // --- View Functions ---

    #[view]
    public fun get_player_details(player_address: address): Details acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        *&borrow_global<Ninja>(player_address).details
    }

    #[view]
    public fun get_game_from_history(player_address: address, game_index: u64): Game acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        let details = &borrow_global<Ninja>(player_address).details;
        assert!(game_index < vector::length(&details.game_history), E_GAME_NOT_FOUND);
        *vector::borrow(&details.game_history, game_index)
    }

    #[view]
    public fun get_games_played(player_address: address): u64 acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.games
    }

    #[view]
    public fun get_high_score(player_address: address): u64 acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.high_score
    }
    
    #[view]
    public fun is_game_active(player_address: address): bool acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.is_game_active
    }

    // New view function to get the current delegate
    #[view]
    public fun get_delegated_signer(player_address: address): address acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.delegated_signer
    }
}
