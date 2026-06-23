#!/usr/bin/env -S bash -eu

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_PROXY_ADMIN
$SPN_EMERGENCY_COUNCIL
$SPN_FUSDC_ADDR
$SPN_SARP_AI
$SPN_CAMELOT_SWAP_ROUTER
$SPN_STARGATE_ADDR
$SPN_PAYMASTER_CALLER_ADDR
$SPN_WETH_ADDR
$SPN_DPPM_HOUR_CREATOR_ADDR
$SPN_DPPM_15_MIN_CREATOR_ADDR
$SPN_DPPM_5_MIN_CREATOR_ADDR
$SPN_ORACLE_ADDR
EOF

log() {
	>&2 echo $@
}

log "SPN_PROXY_ADMIN=$SPN_PROXY_ADMIN"
log "SPN_EMERGENCY_COUNCIL=$SPN_EMERGENCY_COUNCIL"

export SPN_TRADING_BEACON="${SPN_TRADING_BEACON:-$(./deploy-trading-beacon.sh)}"
[ -z "$SPN_TRADING_BEACON" ] && exit 1
log "SPN_TRADING_BEACON=$SPN_TRADING_BEACON"

export SPN_PAYMASTER_ADDR="${SPN_PAYMASTER_ADDR:-$(./deploy-paymaster.sh)}"
[ -z "$SPN_PAYMASTER_ADDR" ] && exit 1
log "SPN_PAYMASTER_ADDR=$SPN_PAYMASTER_ADDR"

export SPN_CLAIMANT_HELPER_ADDR="${SPN_CLAIMANT_HELPER_ADDR:-$(./deploy-claimant-helper.sh)}"
[ -z "$SPN_CLAIMANT_HELPER_ADDR" ] && exit 1
log "SPN_CLAIMANT_HELPER_ADDR=$SPN_CLAIMANT_HELPER_ADDR"

export SPN_SHARE_IMPL_ADDR="${SPN_SHARE_IMPL_ADDR:-$(./deploy-share-impl.sh)}"
[ -z "$SPN_SHARE_IMPL_ADDR" ] && exit 1
log "SPN_SHARE_IMPL_ADDR=$SPN_SHARE_IMPL_ADDR"

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

json="$(./deploy-proxies.sh)"

cast send \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	"$SPN_TRADING_BEACON" \
	'upgradeContracts(address,address,address,address,address,address,address,address)' \
	"$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR" \
	"$SPN_TRADING_DPPM_MINT_IMPL_ADDR" \
	"$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR" \
	"$SPN_TRADING_DPPM_PRICE_IMPL_ADDR" \
	"$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR" \
	"$SPN_TRADING_AMM_MINT_IMPL_ADDR" \
	"$SPN_TRADING_AMM_QUOTES_IMPL_ADDR" \
	"$SPN_TRADING_AMM_PRICE_IMPL_ADDR"

export SPN_FACTORY_PROXY_ADDR="$(echo "$json" | jq -r .factoryAddr)"
log "SPN_FACTORY_PROXY_ADDR=$SPN_FACTORY_PROXY_ADDR"

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
| Emergency council             | \`$SPN_EMERGENCY_COUNCIL\` |
| Trading DPPM mint impl        | \`$SPN_TRADING_DPPM_MINT_IMPL_ADDR\` |
| Trading DPPM extras impl      | \`$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR\` |
| Trading DPPM quotes impl      | \`$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR\` |
| Trading DPPM price impl       | \`$SPN_TRADING_DPPM_PRICE_IMPL_ADDR\` |
| Trading AMM mint impl         | \`$SPN_TRADING_AMM_MINT_IMPL_ADDR\` |
| Trading AMM extras impl       | \`$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR\` |
| Trading AMM quotes impl       | \`$SPN_TRADING_AMM_QUOTES_IMPL_ADDR\` |
| Trading AMM price impl        | \`$SPN_TRADING_AMM_PRICE_IMPL_ADDR\` |
| Share implementation          | \`$SPN_SHARE_IMPL_ADDR\` |
| Factory proxy                 | \`$SPN_FACTORY_PROXY_ADDR\` |
| Helper factory                | \`$SPN_HELPER_FACTORY\` |
| Trading beacon                | \`$SPN_TRADING_BEACON\` |
| LensesV1                      | \`$SPN_LENSESV1\` |
| Sarp AI Resolver              | \`$SPN_SARP_AI\` |
| Claimant helper               | \`$SPN_CLAIMANT_HELPER_ADDR\` |
| Paymaster                     | \`$SPN_PAYMASTER_ADDR\` |
| Paymaster caller              | \`$SPN_PAYMASTER_CALLER_ADDR\` |
| fUSDC                         | \`$SPN_FUSDC_ADDR\` |
|| Camelot swap router           | \`$SPN_CAMELOT_SWAP_ROUTER\` |
|| Stargate                      | \`$SPN_STARGATE_ADDR\` |
|| WETH                          | \`$SPN_WETH_ADDR\` |
|| DPPM hour creator             | \`$SPN_DPPM_HOUR_CREATOR_ADDR\` |
|| DPPM 15 min creator           | \`$SPN_DPPM_15_MIN_CREATOR_ADDR\` |
|| DPPM 5 min creator            | \`$SPN_DPPM_5_MIN_CREATOR_ADDR\` |
|| Oracle                        | \`$SPN_ORACLE_ADDR\` |
|| Superposition URL             | \`$SPN_SUPERPOSITION_URL\` |
|| Superposition key             | \`$SPN_SUPERPOSITION_KEY\` |
EOF

cat <<EOF
{"proxyAdmin":"$SPN_PROXY_ADMIN", "tradingDppmMintImplementation":"$SPN_TRADING_DPPM_MINT_IMPL_ADDR", "tradingDppmExtrasImplementation":"$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR", "tradingDppmPriceImplementation":"$SPN_TRADING_DPPM_PRICE_IMPL_ADDR", "tradingDppmQuotesImplementation":"$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR", "tradingAmmMintImplementation":"$SPN_TRADING_AMM_MINT_IMPL_ADDR", "tradingAmmExtrasImplementation":"$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR", "tradingAmmPriceImplementation":"$SPN_TRADING_AMM_PRICE_IMPL_ADDR", "tradingAmmQuotesImplementation":"$SPN_TRADING_AMM_QUOTES_IMPL_ADDR", "shareImplementation":"$SPN_SHARE_IMPL_ADDR", "factoryProxy":"$SPN_FACTORY_PROXY_ADDR", "helperFactory": "$SPN_HELPER_FACTORY", "lensesV1": "$SPN_LENSESV1", "sarpAi": "$SPN_SARP_AI", "claimantHelper": "$SPN_CLAIMANT_HELPER_ADDR", "paymaster": "$SPN_PAYMASTER_ADDR" }
EOF
