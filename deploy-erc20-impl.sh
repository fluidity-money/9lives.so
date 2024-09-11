#!/bin/sh -ue

forge create Share \
	--json \
	--rpc-url="$SPN_SUPERPOSITION_URL" \
	--private-key="$SPN_DEPLOYER_KEY" \
	$@ \
		| jq -r .deployedTo
