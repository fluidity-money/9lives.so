#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_LONGTAIL_ADDR
$SPN_FUSDC_ADDR
$SPN_PROXY_ADMIN
$SPN_FACTORY_1_IMPL_ADDR
$SPN_FACTORY_2_IMPL_ADDR
$SPN_ERC20_IMPL_ADDR
$SPN_TRADING_MINT_IMPL_ADDR
$SPN_TRADING_EXTRAS_IMPL_ADDR
EOF

make -B

>&2 echo "SPN_FACTORY_1_IMPL_ADDR=$(./deploy-stylus.sh factory-1.wasm)"
>&2 echo "SPN_FACTORY_2_IMPL_ADDR=$(./deploy-stylus.sh factory-2.wasm)"
>&2 echo "SPN_ERC20_IMPL_ADDR=$(./deploy-erc20-impl.sh)"
>&2 echo "SPN_TRADING_MINT_IMPL_ADDR=$(./deploy-stylus.sh trading-mint.wasm)"
>&2 echo "SPN_TRADING_EXTRAS_IMPL_ADDR=$(./deploy-stylus.sh trading-extras.wasm)"
