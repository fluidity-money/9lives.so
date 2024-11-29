#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_PROXY_ADMIN
EOF

SPN_FACTORY_1_IMPL_ADDR="${SPN_FACTORY_1_IMPL_ADDR:-\
	$(./deploy-stylus.sh contract-factory-1.wasm)}"
echo "SPN_FACTORY_1_IMPL_ADDR=$SPN_FACTORY_1_IMPL_ADDR"

SPN_FACTORY_2_IMPL_ADDR="${SPN_FACTORY_2_IMPL_ADDR:-\
	$(./deploy-stylus.sh contract-factory-2.wasm)}"
echo "SPN_FACTORY_2_IMPL_ADDR=$SPN_FACTORY_2_IMPL_ADDR"

SPN_INFRA_MARKET_IMPL_ADDR="${SPN_INFRA_MARKET_IMPL_ADDR:-\
	$(./deploy-stylus.sh contract-infrastructure-market.wasm)}"
echo "SPN_INFRA_MARKET_IMPL_ADDR=$SPN_INFRA_MARKET_IMPL_ADDR"

SPN_LOCKUP_IMPL_ADDR="${SPN_LOCKUP_IMPL_ADDR:-\
	$(./deploy-stylus.sh contract-lockup.wasm)}"
echo "SPN_LOCKUP_IMPL_ADDR=$SPN_LOCKUP_IMPL_ADDR"

SPN_TRADING_AMM_EXTRAS_IMPL_ADDR="${SPN_TRADING_AMM_EXTRAS_IMPL_ADDR:-\
	$(./deploy-stylus.sh contract-trading-amm-extras.wasm)}"
echo "SPN_TRADING_AMM_EXTRAS_IMPL_ADDR=$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR"

SPN_TRADING_AMM_MINT_IMPL_ADDR="${SPN_TRADING_AMM_MINT_IMPL_ADDR:-\
	$(./deploy-stylus.sh contract-trading-amm-mint.wasm)}"
echo "SPN_TRADING_AMM_MINT_IMPL_ADDR=$SPN_TRADING_AMM_MINT_IMPL_ADDR"

SPN_TRADING_DPM_EXTRAS_IMPL_ADDR="${SPN_TRADING_DPM_EXTRAS_IMPL_ADDR:-\
	$(./deploy-stylus.sh contract-trading-dpm-extras.wasm)}"
echo "SPN_TRADING_DPM_EXTRAS_IMPL_ADDR=$SPN_TRADING_DPM_EXTRAS_IMPL_ADDR"

SPN_TRADING_DPM_MINT_IMPL_ADDR="${SPN_TRADING_DPM_MINT_IMPL_ADDR:-\
	$(./deploy-stylus.sh contract-trading-dpm-mint.wasm)}"
echo "SPN_TRADING_DPM_MINT_IMPL_ADDR=$SPN_TRADING_DPM_MINT_IMPL_ADDR"


>&2 cat <<EOF
|            Deployment name             |              Deployment address            |
|----------------------------------------|--------------------------------------------|
| Proxy admin                            | $proxy_admin |
| Factory 1 implementation               | $SPN_FACTORY_1_IMPL_ADDR |
| Factory 2 implementation               | $SPN_FACTORY_2_IMPL_ADDR |
| Optimistic infra market implementation | $SPN_INFRA_MARKET_IMPL_ADDR |
| Trading DPM mint impl                  | $SPN_TRADING_DPM_MINT_IMPL_ADDR |
| Trading DPM extras impl                | $SPN_TRADING_DPM_EXTRAS_IMPL_ADDR |
| Trading AMM extras impl                | $SPN_TRADING_AMM_EXTRAS_IMPL_ADDR |
| Trading AMM mint impl                  | $SPN_TRADING_AMM_EXTRAS_IMPL_ADDR |
| ERC20 implementation                   | $SPN_ERC20_IMPL_ADDR |
| Factory proxy                          | $SPN_FACTORY_PROXY_ADDR |
| LensesV1                               | $lenses_addr |
