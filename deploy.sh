#!/bin/sh -e

log() {
	>&2 echo $@
}

err() {
	log $@
	exit 1
}

# Deploy the ERC20 implementation...

export SPN_ERC20_IMPL="${SPN_ERC20_IMPL:-$(./deploy-erc20-impl.sh)}"

echo "export SPN_ERC20_IMPL=$SPN_ERC20_IMPL" >&2

# Deploy the Trading implemenation...

# Deploy the factory
