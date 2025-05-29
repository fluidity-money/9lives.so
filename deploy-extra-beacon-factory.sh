#!/bin/sh -eu

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	src/ExtrasBeaconFactory.sol:ExtrasBeaconFactory \
		| jq -r .deployedTo
