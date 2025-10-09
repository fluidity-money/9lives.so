#!/bin/sh -e

# Blank upgrade the implementation of the trading contract as known to
# the factory after a deployment. Uses cast twice at the end.

log() {
	>&2 echo $@
}

err() {
	log $@
	exit 1
}

[ -z "$$SPN_SUPERPOSITION_URL" ] && err "SPN_SUPERPOSITION_URL unset"
[ -z "$SPN_SUPERPOSITION_KEY" ] && err "SPN_SUPERPOSITION_KEY unset"
[ -z "$SPN_FACTORY_PROXY_ADDR" ] && err "SPN_FACTORY_PROXY_ADDR unset"

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

cast send \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--json \
	"$SPN_FACTORY_PROXY_ADDR" \
	'upgradeDpmContracts(address,address,address,address)' \
	"$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR" \
	"$SPN_TRADING_DPPM_MINT_IMPL_ADDR" \
	"$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR" \
	"$SPN_TRADING_DPPM_PRICE_IMPL_ADDR"

cast send \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--json \
	"$SPN_FACTORY_PROXY_ADDR" \
	'upgradeAmmContracts(address,address,address,address)' \
	"$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR" \
	"$SPN_TRADING_AMM_MINT_IMPL_ADDR" \
	"$SPN_TRADING_AMM_QUOTES_IMPL_ADDR" \
	"$SPN_TRADING_AMM_PRICE_IMPL_ADDR"
