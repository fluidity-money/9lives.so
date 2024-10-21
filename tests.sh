#!/bin/sh -e

#cargo test -q --features testing $@

make solidity

SPN_SUPERPOSITION_URL=${SPN_SUPERPOSITION_URL:-http://localhost:8547} \
SPN_SUPERPOSITION_KEY=${SPN_SUPERPOSITION_KEY:-b6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659} \
	pnpm run test
