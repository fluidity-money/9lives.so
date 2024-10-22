#!/bin/sh -eu

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	src/LensesV1.sol:LensesV1 \
	--constructor-args \
	"$SPN_LONGTAIL_ADDR" \
	"$SPN_FACTORY_PROXY_ADDR"
