#[test_only]
module guafi::guafi_tests {
    use guafi::guafi::{Self, Rumor, Ticket, GuafiConfig};
    use sui::test_scenario;
    use sui::coin;
    use sui::sui::SUI;
    use sui::clock;
    use std::string;

    const CREATOR: address = @0xA;
    const USER1: address = @0xB;
    const USER2: address = @0xC;
    const USER3: address = @0xD;

    #[test]
    fun test_flow() {
        let mut scenario = test_scenario::begin(CREATOR);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // 1. Init
        guafi::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, CREATOR);

        // 2. Create Rumor
        {
            guafi::create_rumor(
                string::utf8(b"blob_id_123"),
                100, // Price
                3,   // Min participants
                100000, // Deadline
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // 3. User 1 Joins
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER2);

        // 4. User 2 Joins
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER3);

        // 5. User 3 Joins (Trigger Unlock)
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // 6. User 1 Claims Reward
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            
            // Check access
            assert!(guafi::check_access(&rumor, USER1), 0);

            // Claim
            guafi::claim_reward(&mut rumor, &mut ticket, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_to_sender(&scenario, ticket);
        };
        
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_deadline_optional() {
        let mut scenario = test_scenario::begin(CREATOR);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Init
        guafi::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, CREATOR);

        // Create Rumor with deadline = 0 (no deadline)
        {
            guafi::create_rumor(
                string::utf8(b"blob_id_no_deadline"),
                100,
                2,
                0, // No deadline
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // User 1 Joins
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER2);

        // User 2 Joins (Trigger Unlock)
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_unlock_after_join() {
        let mut scenario = test_scenario::begin(CREATOR);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Init
        guafi::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, CREATOR);

        // Create Rumor
        {
            guafi::create_rumor(
                string::utf8(b"blob_id_after_unlock"),
                100,
                2,
                100000,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // User 1 Joins
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER2);

        // User 2 Joins (Trigger Unlock)
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER3);

        // User 3 Joins after unlock (should still work and distribute rewards)
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // User 1 Claims Reward (should get reward from User 3's join)
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            
            guafi::claim_reward(&mut rumor, &mut ticket, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_to_sender(&scenario, ticket);
        };
        
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_seal_approve() {
        let mut scenario = test_scenario::begin(CREATOR);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Init
        guafi::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, CREATOR);

        // Create Rumor
        {
            guafi::create_rumor(
                string::utf8(b"blob_id_seal"),
                100,
                2,
                100000,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // User 1 Joins
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER2);

        // User 2 Joins (Trigger Unlock)
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // Test seal_approve
        {
            let rumor = test_scenario::take_shared<Rumor>(&scenario);
            let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            
            // Should return true when unlocked and ticket is valid
            assert!(guafi::seal_approve(&rumor, &ticket, USER1), 0);
            assert!(guafi::check_ticket_access(&rumor, &ticket), 0);
            
            test_scenario::return_shared(rumor);
            test_scenario::return_to_sender(&scenario, ticket);
        };
        
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 0)] // EInvalidPrice = 0
    fun test_create_rumor_invalid_price() {
        let mut scenario = test_scenario::begin(CREATOR);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        guafi::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, CREATOR);

        // Try to create rumor with price = 0 (should fail)
        guafi::create_rumor(
            string::utf8(b"blob_id"),
            0, // Invalid price
            2,
            100000,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 1)] // EInsufficientPayment = 1
    fun test_join_rumor_wrong_price() {
        let mut scenario = test_scenario::begin(CREATOR);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        guafi::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, CREATOR);

        // Create Rumor
        {
            guafi::create_rumor(
                string::utf8(b"blob_id"),
                100,
                2,
                100000,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // Try to join with wrong payment amount (should fail)
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(50, test_scenario::ctx(&mut scenario)); // Wrong amount
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            // These won't be reached due to expected failure, but needed for compilation
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_refund() {
        let mut scenario = test_scenario::begin(CREATOR);
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Init
        guafi::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, CREATOR);

        // Create Rumor with short deadline
        {
            guafi::create_rumor(
                string::utf8(b"blob_id_refund"),
                100,
                3, // Need 3 participants
                100, // Short deadline
                &clock,
                test_scenario::ctx(&mut scenario)
            );
        };
        test_scenario::next_tx(&mut scenario, USER1);

        // User 1 Joins
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };
        test_scenario::next_tx(&mut scenario, USER2);

        // User 2 Joins (still not enough)
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let mut config = test_scenario::take_shared<GuafiConfig>(&scenario);
            let payment = coin::mint_for_testing<SUI>(100, test_scenario::ctx(&mut scenario));
            
            guafi::join_rumor(&mut rumor, &mut config, payment, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
            test_scenario::return_shared(config);
        };

        // Advance clock past deadline
        clock::set_for_testing(&mut clock, 200);
        test_scenario::next_tx(&mut scenario, USER1);

        // User 1 Refunds
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            
            guafi::refund(&mut rumor, ticket, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
        };
        test_scenario::next_tx(&mut scenario, USER2);

        // User 2 Refunds
        {
            let mut rumor = test_scenario::take_shared<Rumor>(&scenario);
            let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            
            guafi::refund(&mut rumor, ticket, &clock, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(rumor);
        };
        
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
