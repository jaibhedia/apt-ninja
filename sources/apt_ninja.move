module apt_ninja::game {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event;
    use std::debug;   

    // --- Resources and Structs ---

    struct Ninja has key {
        address: String,
        details: Details
    }

    struct Details has store, drop, copy {
        games: u64,
        wins: u64,
        high_score: u64,
        game_history: vector<Game>
    }

    struct Game has store, drop, copy {
        hits: u64,
        wrong_hits: u64,
        misses: u64,
        total_score: u64
    }

    // --- Events ---

    #[event]
    struct ProfileUpdated has drop, store {
        player_address: address,
        total_games: u64,
        total_wins: u64,
        new_high_score: u64,
    }

    // --- Errors ---

    const E_PROFILE_NOT_FOUND: u64 = 0;
    const E_PROFILE_ALREADY_EXISTS: u64 = 1;  
    const E_GAME_NOT_FOUND: u64 = 2;

    // --- Entry Functions ---

    #[entry]
    public fun create_profile(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<Ninja>(addr), error::already_exists(E_PROFILE_ALREADY_EXISTS));

        let initial_details = Details {
            games: 0,
            wins: 0,
            high_score: 0,
            game_history: vector::empty<Game>(),
        };

        move_to(account, Ninja {
            address: string::utf8(b""),
            details: initial_details,
        });
    }
    

    public fun record_game_result(account: &signer, isWin:bool, hits: u64, wrong_hits: u64,misses: u64 total_score: u64) acquires Ninja  {
        let addr = signer::address_of(account);
        assert!(exists<Ninja>(addr), error::not_found(E_PROFILE_NOT_FOUND));

        let player_profile = borrow_global_mut<Ninja>(addr);

        let details = &mut player_profile.details;

        let new_game = Game {
            hits,
            wrong_hits,
            misses,
            total_score,
        };
        if (isWin){
            details.wins = details.wins+1;
        }
        let old_high_score = details.high_score;
        if (old_high_score<total_score){
            details.high_score = total_score
        }
        details.games = details.games + 1;

        vector::push_back(&mut details.game_history, new_game);
        
        event::emit(
            ProfileUpdated {
                player_address: addr,
                total_games: details.games,
                total_wins: details.wins,
                new_high_score: details.high_score,
            }
        );
    }

    // --- View Functions ---

    #[view]
    public fun get_player_details(player_address: address): Details acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        *&borrow_global<Ninja>(player_address).details
    }

    #[view]
    public fun get_game_from_history(player_address: address, game_index: u64): Game acquires Ninja{
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
    public fun get_wins(player_address: address): u64 acquires Ninja{
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.wins
    }

    #[view]
    public fun get_high_score(player_address: address): u64 acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.high_score
    }

    #[view]
    public fun get_high_score(player_address: address): u64 acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.high_score
    }

    #[view]
    public fun get_high_score(player_address: address): u64 acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.high_score
    }

    #[view]
    public fun get_high_score(player_address: address): u64 acquires Ninja {
        assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
        borrow_global<Ninja>(player_address).details.high_score
    }

    // #[view]
    // public fun get_game_history(details:Details):  {
    //     assert!(exists<Ninja>(player_address), error::not_found(E_PROFILE_NOT_FOUND));
    //     *&borrow_global<Ninja>(player_address).details
    // }

}

#[test_only]
module apt_ninja::game_tests {
    use std::signer;
    use apt_ninja::game;
    use std::vector;


    #[test(account = @0x1)]
    fun test_create_profile_successfully(account: &signer) {

        game::create_profile(account);
        let addr = signer::address_of(account);
        
        assert!(game::get_games_played(addr) == 0, 0);
        assert!(game::get_wins(addr) == 0, 1);
        assert!(game::get_win_rate(addr) == 0, 2);
        // assert!(vector::is_empty(addr.game_history), 3);
    }

    #[test(account = @0x2)]
    #[expected_failure(abort_code = 524289)]

    fun test_create_profile_fails_if_exists(account: &signer) {

        game::create_profile(account);
        game::create_profile(account);
    }

    #[test(account = @0x3)]
    fun test_record_single_win(account: &signer) {
        game::create_profile(account);
        game::record_game_result(account, 50, 0, 1000);
        let addr = signer::address_of(account);

        assert!(game::get_games_played(addr) == 1, 0);
        assert!(game::get_wins(addr) == 1, 1);
        assert!(game::get_win_rate(addr) == 100, 2);


        // let game_record = game::get_game_from_history(signer::address_of(account), 0);
        // assert!(game_record.total_score == 1000, 3);
    }

    #[test(account = @0x4)]
    fun test_record_win_and_loss_updates_win_rate(account: &signer) {
        game::create_profile(account);
        let addr = signer::address_of(account);
        game::record_game_result(account, 50, 0, 1000);
        assert!(game::get_games_played(addr) == 1, 0);
        assert!(game::get_wins(addr) == 1, 1);
        assert!(game::get_win_rate(addr) == 100, 2); 


        game::record_game_result(account, 30, 1, 500);
        assert!(game::get_games_played(addr) == 2, 3); 
        assert!(game::get_wins(addr) == 2, 4);
        assert!(game::get_win_rate(addr) == 100, 5);

        game::record_game_result(account, 60, 0, 1200);
        assert!(game::get_games_played(addr) == 3, 6);
        assert!(game::get_wins(addr) == 3, 7);
        assert!(game::get_win_rate(addr) == 100, 8);
}


    // #[test(account = @0x5)]
    // #[expected_failure(abort_code = 0, location = apt_ninja::game)]
    // fun test_record_game_fails_for_nonexistent_profile(account: &signer) {

    //     game::record_game_result(account, 10, 0, 100);
    // }

    // #[test(account = @0x6)]
    // fun test_get_game_from_history(account: &signer) {
    //     game::create_profile(account);
    //     game::record_game_result(account, 10, 2, 100); // Game at index 0
    //     game::record_game_result(account, 20, 1, 200); // Game at index 1
    //     game::record_game_result(account, 30, 0, 300); // Game at index 2

    //     let game1 = game::get_game_from_history(signer::address_of(account), 1);
    //     assert!(game1.hits == 20, 0);
    //     assert!(game1.wrong_hits == 1, 1);
    //     assert!(game1.total_score == 200, 2);
    // }
}

