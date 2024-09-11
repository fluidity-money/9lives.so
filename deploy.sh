#!/bin/sh -e

log() {
	>&2 echo $@
}

err() {
	log $@
	exit 1
}

[ -z "$SPN_TRADING_IMPL" ] && err "SPN_TRADING_IMPL not set"
[ -z "$SPN_FACTORY_IMPL" ] && err "SPN_FACTORY_IMPL not set"

# To get these implementation addresses known beforehand (and they
# should be compiled into the contract), you should estimate nonces.

# Deploy the ERC20 implementation...

export SPN_ERC20_IMPL="${SPN_ERC20_IMPL:-$(./deploy-erc20-impl.sh)}"

echo "export SPN_ERC20_IMPL=$SPN_ERC20_IMPL" >&2

forge script --broadcast --json scripts/DeployFactoryTransparentProxy.s.sol
