module safety_middleware::audit {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use std::vector;

    public struct AuditObject has key, store {
        id: UID,
        tx_digest: vector<u8>,
        action: vector<u8>,
        status: bool,
        timestamp: u64,
    }

    public fun create(
        tx_digest: vector<u8>,
        action: vector<u8>,
        status: bool,
        ctx: &mut TxContext
    ): AuditObject {
        AuditObject {
            id: object::new(ctx),
            tx_digest,
            action,
            status,
            timestamp: 0,
        }
    }
}
