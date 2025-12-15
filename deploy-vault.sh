#!/bin/sh -eu

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	src/Vault.sol:Vault \
	--constructor-args \
	"$SPN_FUSDC_ADDR" \
	"$SPN_FACTORY_PROXY_ADDR" \
	"$SPN_DAO_OP_ADDR" \
		| jq -r .deployedTo
