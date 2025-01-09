#!/bin/sh -eu

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	src/BuyHelper.sol:BuyHelper \
	--constructor-args \
	"$SPN_FACTORY_PROXY_ADDR" \
	"$SPN_LONGTAIL_ADDR" \
	"$SPN_FUSDC_ADDR" \
	"$SPN_WETH_ADDR" \
		| jq -r .deployedTo