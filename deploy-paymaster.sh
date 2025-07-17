#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_FUSDC_ADDR
$SPN_PROXY_ADMIN
EOF

impl=$(forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	src/NineLivesPaymaster.sol:NineLivesPaymaster \
	--constructor-args \
	"$SPN_FUSDC_ADDR" \
		| jq -r .deployedTo)

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy \
	--constructor-args \
	"$impl" \
	"$SPN_PROXY_ADMIN" \
	"$(cast calldata 'initialise(address,address,address)' "$SPN_FUSDC_ADDR" "$SPN_PROXY_ADMIN" "$SPN_STARGATE_ADDR")" \
		| jq -r .deployedTo
