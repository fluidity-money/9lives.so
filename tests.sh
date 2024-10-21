#!/bin/sh -e

#cargo test -q --features testing $@

forge build

SPN_SUPERPOSITION_URL=https://testnet-rpc.superposition.so \
SPN_SUPERPOSITION_KEY=***REMOVED*** \
	pnpm run test
