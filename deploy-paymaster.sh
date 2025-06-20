#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_FUSDC_ADDR
EOF

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	src/NineLivesPaymaster.sol:NineLivesPaymaster \
	--constructor-args \
	"$SPN_FUSDC_ADDR" \
		| jq -r .deployedTo
