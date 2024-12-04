#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_PROXY_ADMIN
$SPN_EMERGENCY_COUNCIL
$SPN_LONGTAIL_ADDR
$SPN_FUSDC_ADDR
EOF

log() {
	>&2 echo $@
}

if [ "$SPN_PROXY_ADMIN" = "0x0000000000000000000000000000000000000000"]; then
	log "zero proxy admin not possible for deploy"
	exit 1
fi

log "SPN_PROXY_ADMIN=$SPN_PROXY_ADMIN"
log "SPN_EMERGENCY_COUNCIL=$SPN_EMERGENCY_COUNCIL"

export SPN_SHARE_IMPL_ADDR="${SPN_SHARE_IMPL_ADDR:-$(./deploy-share-impl.sh)}"
[ -z "$SPN_SHARE_IMPL_ADDR" ] && exit 1
log "SPN_SHARE_IMPL_ADDR=$SPN_SHARE_IMPL_ADDR"

export SPN_LOCKUP_TOKEN_IMPL_ADDR="${SPN_LOCKUP_TOKEN_IMPL_ADDR:-$(./deploy-lockup-token-impl.sh)}"
log "SPN_LOCKUP_TOKEN_IMPL_ADDR=$SPN_LOCKUP_TOKEN_IMPL_ADDR"

export SPN_FACTORY_1_IMPL_ADDR="${SPN_FACTORY_1_IMPL_ADDR:-$(./deploy-stylus.sh contract-factory-1.wasm)}"
[ -z "$SPN_FACTORY_1_IMPL_ADDR" ] && exit 1
log "SPN_FACTORY_1_IMPL_ADDR=$SPN_FACTORY_1_IMPL_ADDR"

export SPN_FACTORY_2_IMPL_ADDR="${SPN_FACTORY_2_IMPL_ADDR:-$(./deploy-stylus.sh contract-factory-2.wasm)}"
[ -z "$SPN_FACTORY_2_IMPL_ADDR" ] && exit 1
log "SPN_FACTORY_2_IMPL_ADDR=$SPN_FACTORY_2_IMPL_ADDR"

export SPN_INFRA_MARKET_IMPL_ADDR="${SPN_INFRA_MARKET_IMPL_ADDR:-$(./deploy-stylus.sh contract-infrastructure-market.wasm)}"
[ -z "$SPN_INFRA_MARKET_IMPL_ADDR" ] && exit 1
log "SPN_INFRA_MARKET_IMPL_ADDR=$SPN_INFRA_MARKET_IMPL_ADDR"

export SPN_LOCKUP_IMPL_ADDR="${SPN_LOCKUP_IMPL_ADDR:-$(./deploy-stylus.sh contract-lockup.wasm)}"
[ -z "$SPN_LOCKUP_IMPL_ADDR" ] && exit 1
log "SPN_LOCKUP_IMPL_ADDR=$SPN_LOCKUP_IMPL_ADDR"

export SPN_TRADING_DPM_EXTRAS_IMPL_ADDR="${SPN_TRADING_DPM_EXTRAS_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-dpm-extras.wasm)}"
[ -z "$SPN_TRADING_DPM_EXTRAS_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_DPM_EXTRAS_IMPL_ADDR=$SPN_TRADING_DPM_EXTRAS_IMPL_ADDR"

export SPN_TRADING_DPM_MINT_IMPL_ADDR="${SPN_TRADING_DPM_MINT_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-dpm-mint.wasm)}"
[ -z "$SPN_TRADING_DPM_MINT_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_DPM_MINT_IMPL_ADDR=$SPN_TRADING_DPM_MINT_IMPL_ADDR"

export SPN_TRADING_DPM_QUOTES_IMPL_ADDR="${SPN_TRADING_DPM_QUOTES_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-dpm-quotes.wasm)}"
[ -z "$SPN_TRADING_DPM_QUOTES_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_DPM_QUOTES_IMPL_ADDR=$SPN_TRADING_DPM_QUOTES_IMPL_ADDR"

export SPN_TRADING_DPM_PRICE_IMPL_ADDR="${SPN_TRADING_DPM_PRICE_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-dpm-quotes.wasm)}"
[ -z "$SPN_TRADING_DPM_PRICE_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_DPM_PRICE_IMPL_ADDR=$SPN_TRADING_DPM_PRICE_IMPL_ADDR"

export SPN_TRADING_AMM_EXTRAS_IMPL_ADDR="${SPN_TRADING_AMM_EXTRAS_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-amm-extras.wasm)}"
[ -z "$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_AMM_EXTRAS_IMPL_ADDR=$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR"

export SPN_TRADING_AMM_MINT_IMPL_ADDR="${SPN_TRADING_AMM_MINT_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-amm-mint.wasm)}"
[ -z "$SPN_TRADING_AMM_MINT_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_AMM_MINT_IMPL_ADDR=$SPN_TRADING_AMM_MINT_IMPL_ADDR"

export SPN_TRADING_AMM_QUOTES_IMPL_ADDR="${SPN_TRADING_AMM_QUOTES_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-amm-quotes.wasm)}"
[ -z "$SPN_TRADING_AMM_QUOTES_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_AMM_QUOTES_IMPL_ADDR=$SPN_TRADING_AMM_QUOTES_IMPL_ADDR"

export SPN_TRADING_AMM_PRICE_IMPL_ADDR="${SPN_TRADING_AMM_PRICE_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-amm-quotes.wasm)}"
[ -z "$SPN_TRADING_AMM_PRICE_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_AMM_PRICE_IMPL_ADDR=$SPN_TRADING_AMM_PRICE_IMPL_ADDR"

json="$(./deploy-proxies.sh)"

export SPN_INFRA_MARKET_PROXY_ADDR="$(echo "$json" | jq -r .infraMarketAddr)"
log "SPN_INFRA_MARKET_PROXY_ADDR=$SPN_INFRA_MARKET_PROXY_ADDR"

export SPN_LOCKUP_PROXY_ADDR="$(echo "$json" | jq -r .lockupAddr)"
log "SPN_LOCKUP_PROXY_ADDR=$SPN_LOCKUP_PROXY_ADDR"

export SPN_FACTORY_PROXY_ADDR="$(echo "$json" | jq -r .factoryAddr)"
log "SPN_FACTORY_PROXY_ADDR=$SPN_FACTORY_PROXY_ADDR"

export SPN_LOCKUP_TOKEN_PROXY_ADDR="$(echo "$json" | jq -r .lockupTokenProxyAddr)"
log "SPN_LOCKUP_TOKEN_PROXY_ADDR=$SPN_LOCKUP_TOKEN_PROXY_ADDR"

export SPN_HELPER_FACTORY="${SPN_HELPER_FACTORY:-$(./deploy-helper-factory.sh)}"
[ -z "$SPN_HELPER_FACTORY" ] && exit 1
log "SPN_HELPER_FACTORY=$SPN_HELPER_FACTORY"

export SPN_LENSESV1="${SPN_LENSESV1:-$(./deploy-lenses.sh)}"
[ -z "$SPN_LENSESV1" ] && exit 1
log "SPN_LENSESV1=$SPN_LENSESV1"

>&2 cat <<EOF
|            Deployment name             |              Deployment address            |
|----------------------------------------|--------------------------------------------|
| Proxy admin                            | \`$SPN_PROXY_ADMIN\` |
| Factory 1 implementation               | \`$SPN_FACTORY_1_IMPL_ADDR\` |
| Factory 2 implementation               | \`$SPN_FACTORY_2_IMPL_ADDR\` |
| Lockup implementation                  | \`$SPN_LOCKUP_IMPL_ADDR\` |
| Optimistic infra market implementation | \`$SPN_INFRA_MARKET_IMPL_ADDR\` |
| Trading DPM mint impl                  | \`$SPN_TRADING_DPM_MINT_IMPL_ADDR\` |
| Trading DPM extras impl                | \`$SPN_TRADING_DPM_EXTRAS_IMPL_ADDR\` |
| Trading DPM price impl                 | \`$SPN_TRADING_DPM_PRICE_IMPL_ADDR\` |
| Trading DPM quotes impl                | \`$SPN_TRADING_DPM_QUOTES_IMPL_ADDR\` |
| Trading DPM price impl                 | \`$SPN_TRADING_DPM_PRICE_IMPL_ADDR\` |
| Trading AMM mint impl                  | \`$SPN_TRADING_AMM_MINT_IMPL_ADDR\` |
| Trading AMM extras impl                | \`$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR\` |
| Trading AMM price impl                 | \`$SPN_TRADING_AMM_PRICE_IMPL_ADDR\` |
| Trading AMM quotes impl                | \`$SPN_TRADING_AMM_QUOTES_IMPL_ADDR\` |
| Trading AMM price impl                 | \`$SPN_TRADING_AMM_PRICE_IMPL_ADDR\` |
| Share implementation                   | \`$SPN_SHARE_IMPL_ADDR\` |
| Lockup token implementation            | \`$SPN_LOCKUP_TOKEN_IMPL_ADDR\` |
| Infrastructure market proxy            | \`$SPN_INFRA_MARKET_PROXY_ADDR\` |
| Lockup proxy                           | \`$SPN_LOCKUP_PROXY_ADDR\` |
| Lockup token proxy                     | \`$SPN_LOCKUP_TOKEN_PROXY_ADDR\` |
| Factory proxy                          | \`$SPN_FACTORY_PROXY_ADDR\` |
| Helper factory                         | \`$SPN_HELPER_FACTORY\` |
| LensesV1                               | \`$SPN_LENSESV1\` |
EOF

cat <<EOF
{"proxyAdmin":"$SPN_PROXY_ADMIN", "factory1Implementation":"$SPN_FACTORY_1_IMPL_ADDR", "factory2Implementation":"$SPN_FACTORY_2_IMPL_ADDR", "lockupImplementation":"$SPN_LOCKUP_IMPL_ADDR", "optimisticInfraMarketImplementation":"$SPN_INFRA_MARKET_IMPL_ADDR", "tradingDpmMintImplementation":"$SPN_TRADING_DPM_MINT_IMPL_ADDR", "tradingDpmExtrasImplementation":"$SPN_TRADING_DPM_EXTRAS_IMPL_ADDR", "tradingDpmPriceImplementation":"$SPN_TRADING_DPM_PRICE_IMPL_ADDR", "tradingDpmQuotesImplementation":"$SPN_TRADING_DPM_QUOTES_IMPL_ADDR", "tradingAmmMintImplementation":"$SPN_TRADING_AMM_MINT_IMPL_ADDR", "tradingAmmExtrasImplementation":"$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR", "tradingAmmPriceImplementation":"$SPN_TRADING_AMM_PRICE_IMPL_ADDR", "tradingAmmQuotesImplementation":"$SPN_TRADING_AMM_QUOTES_IMPL_ADDR", "shareImplementation":"$SPN_SHARE_IMPL_ADDR", "lockupTokenImplementation":"$SPN_LOCKUP_TOKEN_IMPL_ADDR", "infrastructureMarketProxy":"$SPN_INFRA_MARKET_PROXY_ADDR", "lockupProxy":"$SPN_LOCKUP_PROXY_ADDR", "lockupProxyToken": "$SPN_FACTORY_PROXY_ADDR", "factoryProxy":"$SPN_FACTORY_PROXY_ADDR", "helperFactory": "$SPN_HELPER_FACTORY", "lensesV1": "$SPN_LENSESV1" }
