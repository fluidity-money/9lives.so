#!/bin/sh -ue

forge create LockupToken \
	--json \
	--rpc-url="$SPN_SUPERPOSITION_URL" \
	--private-key="$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	$@ \
		| jq -r .deployedTo
