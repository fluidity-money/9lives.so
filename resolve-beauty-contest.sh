#!/bin/sh -u

id="$1"
recipient="$2"

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_KEY
EOF

data="$(\
	curl \
		-H 'Content-Type: application/json' \
		-sd "{\"query\":\"{\\n  campaignById(id: \\\"$id\\\") {\\n    poolAddress \\n    outcomes {\\n      identifier\n    }\\n  }\\n}\"}" \
		https://graph.9lives.so)"

pool_addr="$(echo "$data" | jq -r .data.campaignById.poolAddress)"
outcomes="$(echo "$data" | jq -r '.data.campaignById.outcomes | .[] | .identifier | join(",")')"

[ -z "$outcomes" ] && exit 1

cast send \
	--rpc-url https://rpc.superposition.so \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	0x15f4A8a0b8cD0343fAe5a7FC736cD9e0D7bE4d5C \
	'resolve(address,bytes8[],address)' "$pool_addr" "[$outcomes]" "$recipient"
