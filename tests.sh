#!/bin/sh -e

#make solidity

#cargo test --features testing,trading-backend-dpm -- test_e2e_dpm_should_not_be_able_to_burn $@
cargo test --features testing,trading-backend-amm -- test_e2e_amm_burning $@
#cargo mutants --features testing,trading-backend-dpm $@

if ! [ -z "$SPN_TEST_NO_JS" ]; then
	exit 0
fi

#forge test

exit 0

SPN_SUPERPOSITION_URL=${SPN_SUPERPOSITION_URL:-http://localhost:8547} \
SPN_SUPERPOSITION_KEY=${SPN_SUPERPOSITION_KEY:-b6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659} \
	pnpm run test
