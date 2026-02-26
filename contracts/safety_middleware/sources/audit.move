module safety_middleware::audit {
    public struct AuditObject has key, store {
        id: object::UID,
        tx_digest: vector<u8>,
        action: vector<u8>,
        status: bool,
        timestamp: u64,
    }

    public fun create(
        tx_digest: vector<u8>,
        action: vector<u8>,
        status: bool,
        ctx: &mut tx_context::TxContext
    ): AuditObject {
        AuditObject {
            id: object::new(ctx),
            tx_digest,
            action,
            status,
            timestamp: 0,
        }
    }

    public fun create_and_transfer(
        tx_digest: vector<u8>,
        action: vector<u8>,
        status: bool,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let audit = create(tx_digest, action, status, ctx);
        transfer::public_transfer(audit, owner);
    }
}
