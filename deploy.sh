#!/usr/bin/env -S bash -eu

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_PROXY_ADMIN
$SPN_EMERGENCY_COUNCIL
$SPN_LONGTAIL_ADDR
$SPN_FUSDC_ADDR
$SPN_SARP_AI
$SPN_CAMELOT_SWAP_ROUTER
$SPN_STARGATE_ADDR
$SPN_PAYMASTER_CALLER_ADDR
EOF

log() {
	>&2 echo $@
}

log "SPN_PROXY_ADMIN=$SPN_PROXY_ADMIN"
log "SPN_EMERGENCY_COUNCIL=$SPN_EMERGENCY_COUNCIL"

export SPN_PAYMASTER_ADDR="${SPN_PAYMASTER_ADDR:-$(./deploy-paymaster.sh)}"
[ -z "$SPN_PAYMASTER_ADDR" ] && exit 1
log "SPN_PAYMASTER_ADDR=$SPN_PAYMASTER_ADDR"

export SPN_CLAIMANT_HELPER_ADDR="${SPN_CLAIMANT_HELPER_ADDR:-$(./deploy-claimant-helper.sh)}"
[ -z "$SPN_CLAIMANT_HELPER_ADDR" ] && exit 1
log "SPN_CLAIMANT_HELPER_ADDR=$SPN_CLAIMANT_HELPER_ADDR"

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

export SPN_INFRA_MARKET_IMPL_ADDR="${SPN_INFRA_MARKET_IMPL_ADDR:-$(./deploy-stylus.sh contract-infra-market.wasm)}"
[ -z "$SPN_INFRA_MARKET_IMPL_ADDR" ] && exit 1
log "SPN_INFRA_MARKET_IMPL_ADDR=$SPN_INFRA_MARKET_IMPL_ADDR"

export SPN_LOCKUP_IMPL_ADDR="${SPN_LOCKUP_IMPL_ADDR:-$(./deploy-stylus.sh contract-lockup.wasm)}"
[ -z "$SPN_LOCKUP_IMPL_ADDR" ] && exit 1
log "SPN_LOCKUP_IMPL_ADDR=$SPN_LOCKUP_IMPL_ADDR"

export SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR="${SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-dppm-extras.wasm)}"
[ -z "$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR=$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR"

export SPN_TRADING_DPPM_MINT_IMPL_ADDR="${SPN_TRADING_DPPM_MINT_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-dppm-mint.wasm)}"
[ -z "$SPN_TRADING_DPPM_MINT_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_DPPM_MINT_IMPL_ADDR=$SPN_TRADING_DPPM_MINT_IMPL_ADDR"

export SPN_TRADING_DPPM_QUOTES_IMPL_ADDR="${SPN_TRADING_DPPM_QUOTES_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-dppm-quotes.wasm)}"
[ -z "$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_DPPM_QUOTES_IMPL_ADDR=$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR"

export SPN_TRADING_DPPM_PRICE_IMPL_ADDR="${SPN_TRADING_DPPM_PRICE_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-dppm-price.wasm)}"
[ -z "$SPN_TRADING_DPPM_PRICE_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_DPPM_PRICE_IMPL_ADDR=$SPN_TRADING_DPPM_PRICE_IMPL_ADDR"

export SPN_TRADING_AMM_EXTRAS_IMPL_ADDR="${SPN_TRADING_AMM_EXTRAS_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-amm-extras.wasm)}"
[ -z "$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_AMM_EXTRAS_IMPL_ADDR=$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR"

export SPN_TRADING_AMM_MINT_IMPL_ADDR="${SPN_TRADING_AMM_MINT_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-amm-mint.wasm)}"
[ -z "$SPN_TRADING_AMM_MINT_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_AMM_MINT_IMPL_ADDR=$SPN_TRADING_AMM_MINT_IMPL_ADDR"

export SPN_TRADING_AMM_QUOTES_IMPL_ADDR="${SPN_TRADING_AMM_QUOTES_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-amm-quotes.wasm)}"
[ -z "$SPN_TRADING_AMM_QUOTES_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_AMM_QUOTES_IMPL_ADDR=$SPN_TRADING_AMM_QUOTES_IMPL_ADDR"

export SPN_TRADING_AMM_PRICE_IMPL_ADDR="${SPN_TRADING_AMM_PRICE_IMPL_ADDR:-$(./deploy-stylus.sh contract-trading-amm-price.wasm)}"
[ -z "$SPN_TRADING_AMM_PRICE_IMPL_ADDR" ] && exit 1
log "SPN_TRADING_AMM_PRICE_IMPL_ADDR=$SPN_TRADING_AMM_PRICE_IMPL_ADDR"

export SPN_BEAUTY_CONTEST_IMPL_ADDR="${SPN_BEAUTY_CONTEST_IMPL_ADDR:-$(./deploy-stylus.sh contract-beauty-contest.wasm)}"
[ -z "$SPN_BEAUTY_CONTEST_IMPL_ADDR" ] && exit 1
log "SPN_BEAUTY_CONTEST_IMPL_ADDR=$SPN_BEAUTY_CONTEST_IMPL_ADDR"

json="$(./deploy-proxies.sh)"

export SPN_INFRA_MARKET_PROXY_ADDR="$(echo "$json" | jq -r .infraMarketAddr)"
log "SPN_INFRA_MARKET_PROXY_ADDR=$SPN_INFRA_MARKET_PROXY_ADDR"

export SPN_LOCKUP_PROXY_ADDR="$(echo "$json" | jq -r .lockupAddr)"
log "SPN_LOCKUP_PROXY_ADDR=$SPN_LOCKUP_PROXY_ADDR"

export SPN_FACTORY_PROXY_ADDR="$(echo "$json" | jq -r .factoryAddr)"
log "SPN_FACTORY_PROXY_ADDR=$SPN_FACTORY_PROXY_ADDR"

export SPN_BEAUTY_CONTEST_PROXY_ADDR="$(echo "$json" | jq -r .beautyContestProxyAddr)"
log "SPN_BEAUTY_CONTEST_PROXY_ADDR=$SPN_BEAUTY_CONTEST_PROXY_ADDR"

export SPN_LOCKUP_TOKEN_PROXY_ADDR="$(echo "$json" | jq -r .lockupTokenProxyAddr)"
log "SPN_LOCKUP_TOKEN_PROXY_ADDR=$SPN_LOCKUP_TOKEN_PROXY_ADDR"

export SPN_HELPER_FACTORY="${SPN_HELPER_FACTORY:-$(./deploy-helper-factory.sh)}"
[ -z "$SPN_HELPER_FACTORY" ] && exit 1
log "SPN_HELPER_FACTORY=$SPN_HELPER_FACTORY"

export SPN_LENSESV1="${SPN_LENSESV1:-$(./deploy-lenses.sh)}"
[ -z "$SPN_LENSESV1" ] && exit 1
log "SPN_LENSESV1=$SPN_LENSESV1"

>&2 cat <<EOF
|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | \`$SPN_PROXY_ADMIN\` |
| Factory 1 implementation      | \`$SPN_FACTORY_1_IMPL_ADDR\` |
| Factory 2 implementation      | \`$SPN_FACTORY_2_IMPL_ADDR\` |
| Lockup implementation         | \`$SPN_LOCKUP_IMPL_ADDR\` |
| Optimistic infra predict impl | \`$SPN_INFRA_MARKET_IMPL_ADDR\` |
| Trading DPPM mint impl        | \`$SPN_TRADING_DPPM_MINT_IMPL_ADDR\` |
| Trading DPPM extras impl      | \`$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR\` |
| Trading DPPM quotes impl      | \`$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR\` |
| Trading DPPM price impl       | \`$SPN_TRADING_DPPM_PRICE_IMPL_ADDR\` |
| Trading AMM mint impl         | \`$SPN_TRADING_AMM_MINT_IMPL_ADDR\` |
| Trading AMM extras impl       | \`$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR\` |
| Trading AMM quotes impl       | \`$SPN_TRADING_AMM_QUOTES_IMPL_ADDR\` |
| Trading AMM price impl        | \`$SPN_TRADING_AMM_PRICE_IMPL_ADDR\` |
| Share implementation          | \`$SPN_SHARE_IMPL_ADDR\` |
| Lockup token implementation   | \`$SPN_LOCKUP_TOKEN_IMPL_ADDR\` |
| Infrastructure market proxy   | \`$SPN_INFRA_MARKET_PROXY_ADDR\` |
| Lockup proxy                  | \`$SPN_LOCKUP_PROXY_ADDR\` |
| Lockup token proxy            | \`$SPN_LOCKUP_TOKEN_PROXY_ADDR\` |
| Factory proxy                 | \`$SPN_FACTORY_PROXY_ADDR\` |
| Helper factory                | \`$SPN_HELPER_FACTORY\` |
| LensesV1                      | \`$SPN_LENSESV1\` |
| Beauty contest implementation | \`$SPN_BEAUTY_CONTEST_IMPL_ADDR\` |
| Beauty contest proxy          | \`$SPN_BEAUTY_CONTEST_PROXY_ADDR\` |
| Sarp AI Resolver              | \`$SPN_SARP_AI\` |
| Claimant helper               | \`$SPN_CLAIMANT_HELPER_ADDR\` |
| Paymaster                     | \`$SPN_PAYMASTER_ADDR\` |
EOF

cat <<EOF
{"proxyAdmin":"$SPN_PROXY_ADMIN", "factory1Implementation":"$SPN_FACTORY_1_IMPL_ADDR", "factory2Implementation":"$SPN_FACTORY_2_IMPL_ADDR", "lockupImplementation":"$SPN_LOCKUP_IMPL_ADDR", "optimisticInfraMarketImplementation":"$SPN_INFRA_MARKET_IMPL_ADDR", "tradingDppmMintImplementation":"$SPN_TRADING_DPPM_MINT_IMPL_ADDR", "tradingDppmExtrasImplementation":"$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR", "tradingDppmPriceImplementation":"$SPN_TRADING_DPPM_PRICE_IMPL_ADDR", "tradingDppmQuotesImplementation":"$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR", "tradingAmmMintImplementation":"$SPN_TRADING_AMM_MINT_IMPL_ADDR", "tradingAmmExtrasImplementation":"$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR", "tradingAmmPriceImplementation":"$SPN_TRADING_AMM_PRICE_IMPL_ADDR", "tradingAmmQuotesImplementation":"$SPN_TRADING_AMM_QUOTES_IMPL_ADDR", "shareImplementation":"$SPN_SHARE_IMPL_ADDR", "lockupTokenImplementation":"$SPN_LOCKUP_TOKEN_IMPL_ADDR", "beautyContest": "$SPN_BEAUTY_CONTEST_IMPL_ADDR", "infrastructureMarketProxy":"$SPN_INFRA_MARKET_PROXY_ADDR", "lockupProxyImpl":"$SPN_LOCKUP_PROXY_ADDR", "lockupProxyToken": "$SPN_FACTORY_PROXY_ADDR", "factoryProxy":"$SPN_FACTORY_PROXY_ADDR", "helperFactory": "$SPN_HELPER_FACTORY", "lensesV1": "$SPN_LENSESV1", "sarpAi": "$SPN_SARP_AI", "beautyContestProxy": "$SPN_BEAUTY_CONTEST_PROXY_ADDR", "claimantHelper": "$SPN_CLAIMANT_HELPER_ADDR", "paymaster": "$SPN_PAYMASTER_ADDR" }
EOF
