#!/bin/sh -eu

# Uses the DeployHelper contract to deploy everything. Proxy admin is
# a user-controlled admin account that will govern various ProxyAdmins
# that will be made.

log() {
	>&2 echo $@
}

deploy_hash="$(forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	--broadcast \
	src/DeployHelper.sol:DeployHelper \
	--constructor-args \
	"(\
		$SPN_PROXY_ADMIN, \
		$SPN_EMERGENCY_COUNCIL, \
		$SPN_LOCKUP_TOKEN_IMPL_ADDR, \
		$SPN_SHARE_IMPL_ADDR, \
		$SPN_FACTORY_1_IMPL_ADDR, \
		$SPN_FACTORY_2_IMPL_ADDR, \
		$SPN_INFRA_MARKET_IMPL_ADDR, \
		$SPN_LOCKUP_IMPL_ADDR, \
		$SPN_TRADING_DPM_EXTRAS_IMPL_ADDR, \
		$SPN_TRADING_DPM_MINT_IMPL_ADDR, \
		$SPN_TRADING_DPM_QUOTES_IMPL_ADDR, \
		$SPN_TRADING_DPM_PRICE_IMPL_ADDR, \
		$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR, \
		$SPN_TRADING_AMM_MINT_IMPL_ADDR, \
		$SPN_TRADING_AMM_QUOTES_IMPL_ADDR, \
		$SPN_TRADING_AMM_PRICE_IMPL_ADDR)" \
			| jq -r .transactionHash)"

[ -z "$deploy_hash" ] && exit 1

# Now that we've done that deployment, we need to mine the receipt's
# logs to find the addresses of everything.

receipt="$(cast receipt -r "$SPN_SUPERPOSITION_URL" --json "$deploy_hash")"

factory_addr="0x$(echo "$receipt " | jq -r '.logs.[] | select(.topics[0] == "0x6dace608663275c38fa05e97b413c8d69120e110df4b506e7f73929c1eedb8fe") | .topics[1] | .[-40:]')"

infra_market_addr="0x$(echo "$receipt " | jq -r '.logs.[] | select(.topics[0] == "0xb8005cb3e965cd85446e2dc634d5e50129ac24d200fdd117bf4bd86a55af9e23") | .topics[1] | .[-40:]')"

lockup_addr="0x$(echo "$receipt " | jq -r '.logs.[] | select(.topics[0] == "0xadc39526a5d2deb8a7fe3722515e984d75811f3195d28836ae4ef67d2d216282") | .topics[1] | .[-40:]')"

lockup_token_proxy_addr="0x$(echo "$receipt " | jq -r '.logs.[] | select(.topics[0] == "0x6e62de6bcc281f60aa8cf0e4fe7453a72d9be2708c1a2ef64d45df9d41c22e9a") | .topics[1] | .[-40:]')"

beauty_contest_proxy_addr="0x$(echo "$receipt " | jq -r '.logs.[] | select(.topics[0] == "0xab8a7107daac41d2a708323ce5044e7f965a241d2c5fbe336d314a0de32ed75b") | .topics[1] | .[-40:]')"

cat <<EOF
{"infraMarketAddr": "$infra_market_addr", "lockupAddr": "$lockup_addr", "factoryAddr": "$factory_addr", "lockupTokenProxyAddr": "$lockup_token_proxy_addr", "beautyContestProxyAddr": "$beauty_contest_proxy_addr"}
