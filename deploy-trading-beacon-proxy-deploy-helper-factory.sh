#!/bin/sh -ue

# Also returns the beacon and impl address from a log!

SPN_TRADING_BEACON_PROXY_HELPER_FACTORY_TX="${SPN_TRADING_BEACON_PROXY_HELPER_FACTORY_TX:-$(forge create TradingBeaconProxyDeployHelperFactory \
	--json \
	--rpc-url="$SPN_SUPERPOSITION_URL" \
	--private-key="$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	--constructor-args \
		"$SPN_PROXY_ADMIN" \
		"$SPN_TRADING_AMM_MINT_IMPL_ADDR" \
		"$SPN_TRADING_AMM_QUOTES_IMPL_ADDR" \
		"$SPN_TRADING_AMM_PRICE_IMPL_ADDR" \
		"$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR" \
			| jq -r .transactionHash)}"

>&2 echo "SPN_TRADING_BEACON_PROXY_HELPER_FACTORY_TX=$SPN_TRADING_BEACON_PROXY_HELPER_FACTORY_TX"

cast receipt \
	--rpc-url="$SPN_SUPERPOSITION_URL" \
	--json \
	"$SPN_TRADING_BEACON_PROXY_HELPER_FACTORY_TX" \
		| jq \
			--arg tx "$SPN_TRADING_BEACON_PROXY_HELPER_FACTORY_TX" \
			--arg mint "$SPN_TRADING_AMM_MINT_IMPL_ADDR" \
			--arg quotes "$SPN_TRADING_AMM_QUOTES_IMPL_ADDR" \
			--arg price "$SPN_TRADING_AMM_PRICE_IMPL_ADDR" \
			--arg extras "$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR" \
			--arg admin "$SPN_PROXY_ADMIN" \
'{
	proxy_impl: ("0x"+(.logs[0].topics[1]|.[-40:])),
	beacon: ("0x"+(.logs[0].topics[2]|.[-40:])),
	transaction_hash: $tx,
	helper: .contractAddress,
	mint: $mint,
	quotes: $quotes,
	price: $price,
	extras: $extras,
	admin: $admin
}'
