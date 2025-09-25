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
        };

        move_to(account, Ninja {
            address: string::utf8(b""),
            details: initial_details,
        });
    }

    #[entry]
    public fun start_game(account: &signer) acquires Ninja {
        let addr = signer::address_of(account);
        assert!(exists<Ninja>(addr), error::not_found(E_PROFILE_NOT_FOUND));
        let player_profile = borrow_global_mut<Ninja>(addr);
        let details = &mut player_profile.details;

        assert!(!details.is_game_active, E_GAME_ALREADY_IN_PROGRESS);

        details.ongoing_game = Game { hits: 0, wrong_hits: 0, misses: 0, total_score: 0 };
        details.is_game_active = true;
    }

    #[entry]
    public fun record_hit(account: &signer, hit_type: u8, score_change: u64) acquires Ninja {
        let addr = signer::address_of(account);
        assert!(exists<Ninja>(addr), error::not_found(E_PROFILE_NOT_FOUND));
        let player_profile = borrow_global_mut<Ninja>(addr);
        let details = &mut player_profile.details;

        assert!(details.is_game_active, E_NO_GAME_IN_PROGRESS);
        let game = &mut details.ongoing_game;

        if (hit_type == 0) {
            game.hits = game.hits + 1;
            game.total_score = game.total_score + score_change;
        } else if (hit_type == 1) {
            game.wrong_hits = game.wrong_hits + 1;
            game.total_score = if (game.total_score > score_change) game.total_score - score_change else 0;
        } else {
            game.misses = game.misses + 1;
        }
    }

    #[entry]
    public fun conclude_game(account: &signer) acquires Ninja {
        let addr = signer::address_of(account);
        assert!(exists<Ninja>(addr), error::not_found(E_PROFILE_NOT_FOUND));
        let player_profile = borrow_global_mut<Ninja>(addr);
        let details = &mut player_profile.details;

        assert!(details.is_game_active, E_NO_GAME_IN_PROGRESS);

        let game_data = details.ongoing_game;
        details.is_game_active = false;

        internal_record_game(account, game_data.hits, game_data.wrong_hits, game_data.misses, game_data.total_score);
    }

    fun internal_record_game(account: &signer, hits: u64, wrong_hits: u64, misses: u64, total_score: u64) acquires Ninja {
        let addr = signer::address_of(account);
        let player_profile = borrow_global_mut<Ninja>(addr);
        let details = &mut player_profile.details;

        let new_game = Game { hits, wrong_hits, misses, total_score };

        if (details.high_score < total_score) {
            details.high_score = total_score;
        };

        details.games = details.games + 1;
        vector::push_back(&mut details.game_history, new_game);

        event::emit(ProfileUpdated {
            player_address: addr,
            total_games: details.games,
            new_high_score: details.high_score,
        });
    }

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
}