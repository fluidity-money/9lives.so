#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_FUSDC_ADDR
$SPN_PROXY_ADMIN
$SPN_PAYMASTER_CALLER_ADDR
$SPN_STARGATE_ADDR
$SPN_CAMELOT_SWAP_ROUTER
$SPN_WETH_ADDR
EOF

set +u

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
	"$(cast calldata 'initialise(address,address,address,address,address)' \
		"$SPN_FUSDC_ADDR" \
		"$SPN_PAYMASTER_CALLER_ADDR" \
		"$SPN_STARGATE_ADDR" \
		"$SPN_CAMELOT_SWAP_ROUTER" \
		"$SPN_WETH_ADDR" )" \
		| jq -r .deployedTo
