#!/bin/sh -e

# Simple script that builds and deploys the contracts for testnet.

./build-testnet.sh

export SPN_SUPERPOSITION_URL=https://testnet-rpc.superposition.so

./deploy.sh
