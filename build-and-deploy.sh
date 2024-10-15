#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL $SPN_SUPERPOSITION_KEY
EOF

wallet_addr="$(cast wallet address --private-key $SPN_SUPERPOSITION_KEY)"

eval "$(go run scripts/get-addresses-full-deploy.go "$wallet_addr" 2>&1 1>/dev/null)"

make -B

./deploy-stylus.sh factory.wasm
./deploy-erc20-impl.sh
./deploy-stylus.sh trading-mint.wasm
./deploy-stylus.sh trading-extras.wasm

>&2 echo you must deploy the transparent proxy

cat <<EOF
|    Deployment name     |              Deployment address            |
|------------------------|--------------------------------------------|
| Proxy admin            |  |
| Factory implementation | $SPN_FACTORY_IMPL_ADDR |
| ERC20 implementation   | $SPN_ERC20_IMPL_ADDR |
| Trading mint impl      | $SPN_TRADING_MINT_IMPL_ADDR |
| Trading extras impl    | $SPN_TRADING_EXTRAS_IMPL_ADDR |
| Factory proxy          |  |
