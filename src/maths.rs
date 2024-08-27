use stylus_sdk::alloy_primitives::U256;

/// Payoff sent to a winning position.
pub fn payoff(derivatives_fee: U256, principal_wagered: U256, winning_wagered: U256) -> U256 {
    U256::from(1)
}

#[allow(snake_case)]
pub fn price(n: U256, M_1: U256, N_1: U256, N_i: U256) -> U256 {
    let exp = (U256::from(2) * (N_1 + n) / N_i).pow(U256::from(2) * N_1 / N_i);
    M_1 / (N_1 + n) * exp
}

pub fn cost(n: U256, M_1: U256, N_1: U256, N_i: U256) -> U256 {
    U256::ZERO
}
