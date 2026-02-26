module safety_middleware::policy {
    const E_NOT_OWNER: u64 = 1001;

    public struct PolicyObject has key, store {
        id: object::UID,
        owner: address,
        daily_limit: u64,
        whitelist: vector<address>,
    }

    public fun create(
        owner: address,
        daily_limit: u64,
        whitelist: vector<address>,
        ctx: &mut tx_context::TxContext
    ): PolicyObject {
        PolicyObject {
            id: object::new(ctx),
            owner,
            daily_limit,
            whitelist,
        }
    }

    public fun update_daily_limit(p: &mut PolicyObject, new_limit: u64, ctx: &mut tx_context::TxContext) {
        assert!(tx_context::sender(ctx) == p.owner, E_NOT_OWNER);
        p.daily_limit = new_limit;
    }

    public fun owner(p: &PolicyObject): address {
        p.owner
    }

    public fun daily_limit(p: &PolicyObject): u64 {
        p.daily_limit
    }

    public fun destroy_for_testing(p: PolicyObject) {
        let PolicyObject {
            id,
            owner: _,
            daily_limit: _,
            whitelist: _
        } = p;
        object::delete(id);
    }
}
