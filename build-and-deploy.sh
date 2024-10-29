#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_LONGTAIL_ADDR
$SPN_FUSDC_ADDR
$SPN_PROXY_ADMIN
EOF

wallet_addr="$(cast wallet address --private-key $SPN_SUPERPOSITION_KEY)"

eval "$(go run scripts/get-addresses-full-deploy.go "$wallet_addr" 2>&1 1>/dev/null)"

./build-and-deploy-impls.sh

>&2 echo "SPN_FACTORY_PROXY_ADDR=$(./deploy-factory-proxy.sh $SPN_PROXY_ADMIN | jq -r .deployedTo)"

proxy_admin="$(cast admin --rpc-url "$SPN_SUPERPOSITION_URL" "$SPN_FACTORY_PROXY_ADDR")"

lenses_addr="$(./deploy-lenses.sh | jq -r .deployedTo)"

>&2 cat <<EOF
|      Deployment name     |              Deployment address            |
|--------------------------|--------------------------------------------|
| Proxy admin              | $proxy_admin |
| Factory 1 implementation | $SPN_FACTORY_1_IMPL_ADDR |
| Factory 2 implementation | $SPN_FACTORY_2_IMPL_ADDR |
| ERC20 implementation     | $SPN_ERC20_IMPL_ADDR |
| Trading mint impl        | $SPN_TRADING_MINT_IMPL_ADDR |
| Trading extras impl      | $SPN_TRADING_EXTRAS_IMPL_ADDR |
| Factory proxy            | $SPN_FACTORY_PROXY_ADDR |
| LensesV1                 | $lenses_addr |
EOF
