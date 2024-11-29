
#[cfg(all(
    any(
        feature = "contract-trading-extras",
        feature = "contract-trading-mint",
        feature = "contract-trading-quotes",
        feature = "contract-trading-price"
    ),
    not(any(
        feature = "trading-backend-dpm",
        feature = "trading-backend-amm"
    ))
))]
compile_error!(
    "trading-backend-dpm or trading-backend-amm must be configured."
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

#[cfg(feature = "contract-trading-quotes")]
pub use crate::contract_trading_quotes::user_entrypoint;

#[cfg(feature = "contract-trading-price")]
pub use crate::contract_trading_price::user_entrypoint;
