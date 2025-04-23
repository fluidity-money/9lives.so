#!/usr/bin/env -S bash -eu

# Deploy the trading contract one off helper contract.

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_PROXY_ADMIN
$SPN_FUSDC_ADDR
EOF

log() {
	>&2 echo $@
}

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

./deploy-trading-beacon-proxy-deploy-helper-factory.sh
