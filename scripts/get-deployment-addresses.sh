#!/bin/sh -eu

get_nonce() {
	curl \
		-H 'Content-Type: application/json' \
		-sd "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionCount\",\"params\":[\"$SPN_DEPLOYER_ADDR\", \"latest\"]}" "$SPN_SUPERPOSITION_URL" \
			| jq -r .result
}

cur_nonce="$(printf "%d\n" $(get_nonce))"

echo $((cur_nonce+1))