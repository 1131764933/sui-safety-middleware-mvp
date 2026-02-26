#[test_only]
module safety_middleware::policy_tests {
    use safety_middleware::policy;

    #[test]
    fun test_create_policy() {
        let mut ctx = tx_context::dummy();
        let owner = tx_context::sender(&ctx);
        let whitelist = vector::singleton(owner);
        let p = policy::create(owner, 1000, whitelist, &mut ctx);

        assert!(policy::owner(&p) == owner, 1000);
        assert!(policy::daily_limit(&p) == 1000, 1001);
        policy::destroy_for_testing(p);
    }

    #[test]
    #[expected_failure(abort_code = 1001)]
    fun test_update_limit_unauthorized() {
        let mut ctx = tx_context::dummy();
        let owner = @0x123;
        let whitelist = vector::singleton(owner);
        let mut p = policy::create(owner, 1000, whitelist, &mut ctx);

        policy::update_daily_limit(&mut p, 2000, &mut ctx);
        policy::destroy_for_testing(p);
    }
}
