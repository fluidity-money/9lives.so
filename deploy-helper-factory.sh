#!/bin/sh -eu

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	src/HelperFactory.sol:HelperFactory \
	--constructor-args \
	"$SPN_FUSDC_ADDR" \
	"$SPN_FACTORY_PROXY_ADDR" \
	"$SPN_INFRA_MARKET_PROXY_ADDR" \
		| jq -r .deployedTo