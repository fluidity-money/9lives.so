#!/bin/sh -eu

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	src/BuyHelper2.sol:BuyHelper2 \
	--constructor-args \
	"$SPN_FACTORY_PROXY_ADDR" \
	"$SPN_LONGTAIL_ADDR" \
	"$SPN_FUSDC_ADDR" \
	"$SPN_WETH_ADDR" \
	"$SPN_CAMELOT_SWAP_ROUTER" \
		| jq -r .deployedTo
