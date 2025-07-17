#!/bin/sh -e

# Simple script that builds and deploys the contracts for testnet.

./build-testnet.sh

export \
	SPN_SUPERPOSITION_URL=https://testnet-rpc.superposition.so \
	SPN_FUSDC_ADDR=0x0000000000000000000000000000000000000000 \
	SPN_STARGATE_ADDR=0x0000000000000000000000000000000000000000

./deploy.sh
