#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_FUSDC_ADDR
$SPN_PROXY_ADMIN
$SPN_PAYMASTER_CALLER_ADDR
$SPN_STARGATE_ADDR
EOF

[ -z "$SPN_PAYMASTER_IMPL" ] && SPN_PAYMASTER_IMPL=$(\
	forge create --json \
		--rpc-url "$SPN_SUPERPOSITION_URL" \
		--private-key "$SPN_SUPERPOSITION_KEY" \
		--broadcast \
		src/NineLivesPaymaster.sol:NineLivesPaymaster \
		--constructor-args \
		"$SPN_FUSDC_ADDR" \
			| jq -r .deployedTo)

>&2 echo "SPN_PAYMASTER_IMPL=$SPN_PAYMASTER_IMPL"

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	foundry-libs/openzeppelin-contracts/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy \
	--constructor-args \
	"$SPN_PAYMASTER_IMPL" \
	"$SPN_PROXY_ADMIN" \
	"$(cast calldata 'initialise(address,address,address)' "$SPN_FUSDC_ADDR" "$SPN_PAYMASTER_CALLER_ADDR" "$SPN_STARGATE_ADDR")" \
		| jq -r .deployedTo
