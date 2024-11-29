use proptest::prelude::*;

#[test]
fn test_infra_market_happy_path() {
Simple situation, someone creates a infra market, and during its optimistic stage someone calls it. It's not whinged about, and it calls predict without issue.
}

proptest! {
    #[test]
    fn test_timing_accurate(campaign_call_start in any::<u64>()) {
    }
}
