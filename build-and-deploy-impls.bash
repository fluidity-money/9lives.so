#!/usr/bin/env -S bash -eu

cat >/dev/null <<EOF
$SPN_SUPERPOSITION_URL
$SPN_SUPERPOSITION_KEY
$SPN_AMM_ADDR
$SPN_FUSDC_ADDR
$SPN_PROXY_ADMIN
$SPN_FACTORY_PROXY_ADDR
$SPN_FACTORY_1_IMPL_ADDR
$SPN_FACTORY_2_IMPL_ADDR
$SPN_ERC20_IMPL_ADDR
$SPN_TRADING_MINT_IMPL_ADDR
$SPN_TRADING_EXTRAS_IMPL_ADDR
EOF

make -B

err() {
	>&2 echo $@
	exit 1
}

# Sanity check the deployed addresses to see if they're consistent with the nonce
# expectation.

impl_factory_1_addr="$(./deploy-stylus.sh contract-factory-1.wasm)"
[ "$impl_factory_1_addr" = "${SPN_FACTORY_1_IMPL_ADDR,,}" ] || err "factory 1 differs"
>&2 echo "SPN_FACTORY_1_IMPL_ADDR='$impl_factory_1_addr'"
impl_factory_2_addr="$(./deploy-stylus.sh contract-factory-2.wasm)"
[ "$impl_factory_2_addr" = "${SPN_FACTORY_2_IMPL_ADDR,,}" ] || err "factory 2 differs"
>&2 echo "SPN_FACTORY_2_IMPL_ADDR='$impl_factory_2_addr'"
trading_mint_impl="$(./deploy-stylus.sh contract-trading-trading-mint.wasm)"
[ "$trading_mint_impl" = "${SPN_TRADING_MINT_IMPL_ADDR,,}" ] || err "trading mint differs"
>&2 echo "SPN_TRADING_MINT_IMPL_ADDR='$trading_mint_impl'"
trading_extras_impl="$(./deploy-stylus.sh contract-trading-trading-extras.wasm)"
[ "$trading_extras_impl" = "${SPN_TRADING_EXTRAS_IMPL_ADDR,,}" ] || err "trading extras differs"
>&2 echo "SPN_TRADING_EXTRAS_IMPL_ADDR='$trading_extras_impl'"
