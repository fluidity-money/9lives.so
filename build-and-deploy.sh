#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_PROXY_ADMIN_ADDR
$SPN_ORACLE_ADDR
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_LONGTAIL_ADDR
$SPN_FUSDC_ADDR
EOF

wallet_addr="$(cast wallet address --private-key $SPN_SUPERPOSITION_KEY)"

eval "$(go run scripts/get-addresses-full-deploy.go "$wallet_addr" 2>&1 1>/dev/null)"

make -B

echo "SPN_FACTORY_1_IMPL_ADDR=$(./deploy-stylus.sh factory-1.wasm)"
echo "SPN_FACTORY_2_IMPL_ADDR=$(./deploy-stylus.sh factory-2.wasm)"
echo "SPN_ERC20_IMPL_ADDR=$(./deploy-erc20-impl.sh)"
echo "SPN_TRADING_MINT_IMPL_ADDR=$(./deploy-stylus.sh trading-mint.wasm)"
echo "SPN_TRADING_EXTRAS_IMPL_ADDR=$(./deploy-stylus.sh trading-extras.wasm)"

cat <<EOF
|      Deployment name     |              Deployment address            |
|--------------------------|--------------------------------------------|
| Proxy admin              |  |
| Factory 1 implementation | $SPN_FACTORY_1_IMPL_ADDR |
| Factory 2 implementation | $SPN_FACTORY_2_IMPL_ADDR |
| ERC20 implementation     | $SPN_ERC20_IMPL_ADDR |
| Trading mint impl        | $SPN_TRADING_MINT_IMPL_ADDR |
| Trading extras impl      | $SPN_TRADING_EXTRAS_IMPL_ADDR |
| Factory proxy            |  |
