#!/bin/sh -eu

originating_chain_id=42161
spn_chain_id=55244

export SPN_PAYMASTER_OP=0 # Mint

# Mints with the Paymaster using a Permit blob, the standard fee, and the graph.

graph=https://testnet-rpc.superposition.so

echo >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_FUSDC_ADDR
$SPN_PAYMASTER_ADDR
$SPN_PAYMASTER_MARKET
$SPN_PAYMASTER_AMT
$SPN_PAYMASTER_REFERRER
$SPN_PAYMASTER_OUTCOME
EOF

cast_call() {
	cast call --rpc-url $SPN_SUPERPOSITION_URL $@
}

sender="$(echo $SPN_SUPERPOSITION_KEY | go run scripts/eth-key-to-addr.go)"

export SPN_PERMIT_NONCE="$(cast_call $SPN_FUSDC_ADDR 'nonces(address)(uint256)' $sender)"
export SPN_PERMIT_NAME="$(cast_call $SPN_FUSDC_ADDR 'name()(string)')"

paymaster_domain="$(cast_call \
	$SPN_PAYMASTER_ADDR 'computeDomainSeparator(uint256)(bytes32)' \
	$spn_chain_id)"

paymaster_nonce="$(cast_call $SPN_PAYMASTER_ADDR 'nonces(bytes32,address)(uint256)' \
	$paymaster_domain \
	$sender)"

forge script --json scripts/PaymasterSig.s.sol | jq -r '.logs | @csv'
