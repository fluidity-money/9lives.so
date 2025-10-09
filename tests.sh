#!/bin/sh -e

export \
	SPN_SUPERPOSITION_URL=${SPN_SUPERPOSITION_URL:-http://localhost:8547} \
	SPN_SUPERPOSITION_KEY=${SPN_SUPERPOSITION_KEY:-b6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659}  \
	SPN_TIMESCALE_URL=postgres://superposition:superposition@localhost?sslmode=disable

make solidity

# cargo test --features testing,trading-backend-dppm $@

cargo test --features testing,trading-backend-amm $@

#cargo mutants \
#	--features testing,trading-backend-dppm \
#	$(printf -- '-f %s ' src/*dppm*.rs) $@

#cargo mutants \
#	--features testing,trading-backend-amm \
#	$(printf -- '-f %s ' src/*amm*.rs src/*trading*.rs)

go test ./...

if ! [ -z "$SPN_TEST_NO_JS" ]; then
	exit 0
fi

forge test

pnpm run test
