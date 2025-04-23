#!/bin/sh -ue

forge create TradingBeaconProxyDeployHelperFactory \
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
	| jq -r .deployedTo
