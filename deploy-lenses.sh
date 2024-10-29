#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_AMM_ADDR
$SPN_FACTORY_PROXY_ADDR
EOF

word_packing_lib_addr="$(\
	forge create --json \
		--rpc-url "$SPN_SUPERPOSITION_URL" \
		--private-key "$SPN_SUPERPOSITION_KEY" \
		src/WordPackingLib.sol:WordPackingLib \
	| jq -r .deployedTo)"

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	src/LensesV1.sol:LensesV1 \
	--libraries "src/WordPackingLib.sol:WordPackingLib:$word_packing_lib_addr" \
	--constructor-args \
	"$SPN_AMM_ADDR" \
	"$SPN_FACTORY_PROXY_ADDR"
