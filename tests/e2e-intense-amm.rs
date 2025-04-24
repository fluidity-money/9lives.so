#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use proptest::prelude::*;

#[derive(Clone, Debug, PartialEq)]
struct ActionAddLiquidity {

}

#[derive(Clone, Debug, PartialEq)]
struct ActionRemoveLiquidity {

}

#[derive(Clone, Debug, PartialEq)]
struct ActionMint {

}

#[derive(Clone, Debug, PartialEq)]
struct ActionBurn {

}

#[derive(Clone, Debug, PartialEq)]
struct ActionClaimLiquidity {

}
