/// Module: guafi
module guafi::guafi {
    use std::string::{String};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::event;
    use sui::clock::{Clock};
    use sui::object;
    use sui::transfer;

    // Errors
    const EInvalidPrice: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ERumorClosed: u64 = 3;
    const ERumorNotFailed: u64 = 4;
    const EDeadlineNotPassed: u64 = 5;
    const ENoReward: u64 = 6;
    const ENotUnlocked: u64 = 7;
    const EInvalidTicket: u64 = 8;

    // Constants
    const BASIS_POINTS: u64 = 10000;
    const ALPHA: u64 = 4000; // 40% to Creator
    const BETA: u64 = 5000; // 50% to Reward Pool
    const GAMMA: u64 = 1000; // 10% to Protocol

    // Status
    const STATUS_PENDING: u8 = 0;
    const STATUS_UNLOCKED: u8 = 1;
    const STATUS_FAILED: u8 = 2;

    // Precision for reward calculation
    const REWARD_PRECISION: u128 = 1_000_000_000_000;

    public struct Rumor has key, store {
        id: UID,
        title: String,
        blob_id: String,
        price: u64,
        min_participants: u64,
        participants_count: u64,
        deadline: u64,
        status: u8,
        creator: address,
        principal_vault: Balance<SUI>, // Holds funds before unlock
        reward_pool: Balance<SUI>,     // Holds reward funds after unlock
        acc_reward_per_share: u128,
    }

    public struct Ticket has key, store {
        id: UID,
        rumor_id: ID,
        reward_debt: u128,
    }

    public struct GuafiConfig has key {
        id: UID,
        protocol_vault: Balance<SUI>,
        admin: address,
    }

    // Events
    public struct RumorCreated has copy, drop {
        rumor_id: ID,
        creator: address,
        title: String,
        blob_id: String,
        price: u64,
        min_participants: u64,
        deadline: u64,
    }

    public struct RumorJoined has copy, drop {
        rumor_id: ID,
        participant: address,
    }

    public struct RumorUnlocked has copy, drop {
        rumor_id: ID,
    }

    public struct RewardClaimed has copy, drop {
        rumor_id: ID,
        participant: address,
        amount: u64,
    }

    public struct RumorFailed has copy, drop {
        rumor_id: ID,
    }

    public struct RefundClaimed has copy, drop {
        rumor_id: ID,
        participant: address,
        amount: u64,
    }

    fun init(ctx: &mut TxContext) {
        let config = GuafiConfig {
            id: object::new(ctx),
            protocol_vault: balance::zero(),
            admin: ctx.sender(),
        };
        transfer::share_object(config);
    }

    public entry fun create_rumor(
        title: String,
        blob_id: String,
        price: u64,
        min_participants: u64,
        deadline: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(price > 0, EInvalidPrice);
        // deadline is optional: if 0, means no deadline
        if (deadline > 0) {
            assert!(deadline > clock.timestamp_ms(), EDeadlineNotPassed);
        };

        let rumor = Rumor {
            id: object::new(ctx),
            title,
            blob_id,
            price,
            min_participants,
            participants_count: 0,
            deadline,
            status: STATUS_PENDING,
            creator: ctx.sender(),
            principal_vault: balance::zero(),
            reward_pool: balance::zero(),
            acc_reward_per_share: 0,
        };

        event::emit(RumorCreated {
            rumor_id: object::id(&rumor),
            creator: ctx.sender(),
            title: rumor.title,
            blob_id: rumor.blob_id,
            price,
            min_participants,
            deadline,
        });

        transfer::share_object(rumor);
    }

    public entry fun join_rumor(
        rumor: &mut Rumor,
        config: &mut GuafiConfig,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check status
        if (rumor.status == STATUS_PENDING) {
            // Check deadline only if it's set (non-zero)
            if (rumor.deadline > 0) {
                assert!(clock.timestamp_ms() < rumor.deadline, ERumorClosed);
            };
        } else {
            assert!(rumor.status == STATUS_UNLOCKED, ERumorClosed);
        };
        
        assert!(payment.value() == rumor.price, EInsufficientPayment);

        let coin_balance = payment.into_balance();
        let total_amount = coin_balance.value();

        // Calculate Beta portion for reward tracking
        let beta_amount = (total_amount * BETA) / BASIS_POINTS;

        // Update acc_reward_per_share
        // If this is the first participant, count is 0.
        // If count > 0, we distribute beta_amount to existing participants.
        if (rumor.participants_count > 0) {
             let reward_per_share_delta = (beta_amount as u128 * REWARD_PRECISION) / (rumor.participants_count as u128);
             rumor.acc_reward_per_share = rumor.acc_reward_per_share + reward_per_share_delta;
        };

        // Mint Ticket
        let ticket = Ticket {
            id: object::new(ctx),
            rumor_id: object::id(rumor),
            reward_debt: rumor.acc_reward_per_share,
        };

        rumor.participants_count = rumor.participants_count + 1;

        // Handle Funds
        if (rumor.status == STATUS_UNLOCKED) {
             // Already unlocked, distribute immediately
             let mut balance_mut = coin_balance;
             
             let alpha_amount = (total_amount * ALPHA) / BASIS_POINTS;
             // beta_amount calculated above
             let gamma_amount = total_amount - alpha_amount - beta_amount;

             let creator_payment = balance_mut.split(alpha_amount);
             transfer::public_transfer(coin::from_balance(creator_payment, ctx), rumor.creator);

             let protocol_payment = balance_mut.split(gamma_amount);
             config.protocol_vault.join(protocol_payment);

             // Remaining is Beta (plus dust?), put in reward pool
             rumor.reward_pool.join(balance_mut);
        } else {
            // Pending, hold in principal vault
            rumor.principal_vault.join(coin_balance);

            // Check if we should unlock
            if (rumor.participants_count >= rumor.min_participants) {
                rumor.status = STATUS_UNLOCKED;
                
                // Distribute ALL held funds
                let total_held = rumor.principal_vault.value();
                let mut all_funds = rumor.principal_vault.split(total_held);
                
                let alpha_total = (total_held * ALPHA) / BASIS_POINTS;
                let beta_total = (total_held * BETA) / BASIS_POINTS;
                let gamma_total = total_held - alpha_total - beta_total;

                let creator_payment = all_funds.split(alpha_total);
                transfer::public_transfer(coin::from_balance(creator_payment, ctx), rumor.creator);

                let protocol_payment = all_funds.split(gamma_total);
                config.protocol_vault.join(protocol_payment);

                // Remaining Beta to reward pool
                rumor.reward_pool.join(all_funds);

                event::emit(RumorUnlocked { rumor_id: object::id(rumor) });
            };
        };

        event::emit(RumorJoined {
            rumor_id: object::id(rumor),
            participant: ctx.sender(),
        });

        transfer::public_transfer(ticket, ctx.sender());
    }

    public entry fun claim_reward(
        rumor: &mut Rumor,
        ticket: &mut Ticket,
        ctx: &mut TxContext
    ) {
        assert!(ticket.rumor_id == object::id(rumor), ENoReward);
        assert!(rumor.status == STATUS_UNLOCKED, ENotUnlocked);
        
        let pending_reward = (rumor.acc_reward_per_share - ticket.reward_debt);
        
        if (pending_reward > 0) {
            let reward_amount = (pending_reward / REWARD_PRECISION) as u64;

            if (reward_amount > 0) {
                // Ensure we have enough funds (should be guaranteed by logic)
                let available = rumor.reward_pool.value();
                let final_amount = if (reward_amount > available) { available } else { reward_amount };
                
                if (final_amount > 0) {
                    let reward_coin = coin::from_balance(rumor.reward_pool.split(final_amount), ctx);
                    transfer::public_transfer(reward_coin, ctx.sender());
                    
                    event::emit(RewardClaimed {
                        rumor_id: object::id(rumor),
                        participant: ctx.sender(),
                        amount: final_amount,
                    });
                }
            };
            
            ticket.reward_debt = rumor.acc_reward_per_share;
        };
    }

    public entry fun refund(
        rumor: &mut Rumor,
        ticket: Ticket,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check if failed
        if (rumor.status != STATUS_FAILED) {
            let deadline_passed = if (rumor.deadline > 0) {
                clock.timestamp_ms() > rumor.deadline
            } else {
                false // No deadline, never fails due to deadline
            };
            
            if (rumor.status == STATUS_PENDING && deadline_passed && rumor.participants_count < rumor.min_participants) {
                rumor.status = STATUS_FAILED;
                event::emit(RumorFailed { rumor_id: object::id(rumor) });
            } else {
                abort ERumorNotFailed
            };
        };

        let Ticket { id, rumor_id, reward_debt: _ } = ticket;
        assert!(rumor_id == object::id(rumor), EInvalidTicket);
        // Verify ticket ownership - in Sui, if user can pass the ticket, they own it
        // But we should still verify the ticket belongs to this rumor
        object::delete(id);

        // Refund price
        // Everyone paid `price`.
        let refund_amount = rumor.price;
        
        // Ensure vault has funds
        let available = rumor.principal_vault.value();
        assert!(available >= refund_amount, EInsufficientPayment); // Should not happen

        let refund_coin = coin::from_balance(rumor.principal_vault.split(refund_amount), ctx);
        transfer::public_transfer(refund_coin, ctx.sender());

        event::emit(RefundClaimed {
            rumor_id: object::id(rumor),
            participant: ctx.sender(),
            amount: refund_amount,
        });
    }

    // For Seal Integration
    // Seal needs to verify on-chain that user has a valid ticket for this rumor
    // This function checks if a ticket is valid for access control
    public fun check_ticket_access(rumor: &Rumor, ticket: &Ticket): bool {
        ticket.rumor_id == object::id(rumor) && rumor.status == STATUS_UNLOCKED
    }

    // Seal approve function - called by Seal Keyserver to verify access
    // Returns true if user has valid ticket and rumor is unlocked
    public fun seal_approve(
        rumor: &Rumor,
        ticket: &Ticket,
        _user: address
    ): bool {
        // In Sui, if user can pass the ticket object, they own it
        // So we just need to verify:
        // 1. Ticket belongs to this rumor
        // 2. Rumor is unlocked
        ticket.rumor_id == object::id(rumor) && rumor.status == STATUS_UNLOCKED
    }

    // Legacy function for backward compatibility
    public fun check_access(rumor: &Rumor, _user: address): bool {
        rumor.status == STATUS_UNLOCKED
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
