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
	"($SPN_PROXY_ADMIN,$SPN_EMERGENCY_COUNCIL,$SPN_LOCKUP_TOKEN_IMPL_ADDR,$SPN_SHARE_IMPL_ADDR,$SPN_FACTORY_1_IMPL_ADDR,$SPN_FACTORY_2_IMPL_ADDR,$SPN_LOCKUP_IMPL_ADDR,$SPN_TRADING_DPPM_EXTRAS_IMPL_ADDR,$SPN_TRADING_DPPM_MINT_IMPL_ADDR,$SPN_TRADING_DPPM_QUOTES_IMPL_ADDR,$SPN_TRADING_DPPM_PRICE_IMPL_ADDR,$SPN_TRADING_AMM_EXTRAS_IMPL_ADDR,$SPN_TRADING_AMM_MINT_IMPL_ADDR,$SPN_TRADING_AMM_QUOTES_IMPL_ADDR,$SPN_TRADING_AMM_PRICE_IMPL_ADDR,$SPN_BEAUTY_CONTEST_IMPL_ADDR)" \
			| jq -r .transactionHash)"

[ -z "$deploy_hash" ] && exit 1

# Now that we've done that deployment, we need to mine the receipt's
# logs to find the addresses of everything.

receipt="$(cast receipt -r "$SPN_SUPERPOSITION_URL" --json "$deploy_hash")"

factory_addr="0x$(echo "$receipt " | jq -r '.logs.[] | select(.topics[0] == "0x6dace608663275c38fa05e97b413c8d69120e110df4b506e7f73929c1eedb8fe") | .topics[1] | .[-40:]')"

cat <<EOF
{"factoryAddr": "$factory_addr", "beautyContestProxyAddr": "$beauty_contest_proxy_addr"}
