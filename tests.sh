#!/bin/sh

cargo test -q --features testing >/dev/null

SPN_SUPERPOSITION_URL=http://localhost:8547 \
	pnpm run test
