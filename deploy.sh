#!/bin/sh -e

log() {
	>&2 echo $@
}

err() {
	log $@
	exit 1
}

# Deploy the ERC20 implementation...

# Deploy the Trading implemenation...

# Deploy the factory
