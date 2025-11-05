#!/bin/sh -u

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	src/TradingBeacon.sol:TradingBeacon \
		| jq -r .deployedTo
