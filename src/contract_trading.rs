
#[cfg(all(
    any(
        feature = "contract-trading-mint",
        feature = "contract-trading-extras"
    ),
    not(any(
        feature = "trading-backend-dpm",
        feature = "trading-backend-amm"
    ))
))]
compile_error!(
    "trading-backend-dpm or trading-backenda-amm must be configured."
);

#[cfg(all(
    feature = "trading-backend-dpm",
    feature = "trading-backend-amm"
))]
compile_error!(
    "trading-backend-dpm and trading-backenda-amm cannot be configured at the same time."
);

#[cfg(feature = "contract-trading-mint")]
pub use crate::contract_trading_mint::user_entrypoint;

#[cfg(feature = "contract-trading-extras")]
pub use crate::contract_trading_extras::user_entrypoint;
