#!/bin/sh -u

id="$1"
recipient="$2"

data="$(\
	curl \
		-H 'Content-Type: application/json' \
		-sd "{\"query\":\"{\\n  campaignById(id: \\\"$id\\\") {\\n    poolAddress \\n    outcomes {\\n      identifier\n    }\\n  }\\n}\"}" \
		https://testnet-graph.9lives.so)"

pool_addr="$(echo "$data" | jq -r .data.campaignById.poolAddress)"
outcomes="$(echo "$data" | jq -r '[.data.campaignById.outcomes[].identifier] | join(",")')"

[ -z "$outcomes" ] && exit 1

cast send \
	--rpc-url https://testnet-rpc.superposition.so \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	0xca018c29994c2bd8ff9b5ff80a7010c5a0c0bf51 \
	'resolve(address,bytes8[],address)' "$pool_addr" "[$outcomes]" "$recipient"
