#!/bin/sh -e

export PROPTEST_CASES=10

cargo mutants\
	--features testing,trading-backend-dppm \
	$(printf -- '-f %s ' src/*dppm*.rs src/trading_private.rs) $@

cargo mutants \
	--features testing,trading-backend-amm \
	$(printf -- '-f %s ' src/*amm*.rs src/trading_private.rs)
