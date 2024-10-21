#!/bin/sh -e

log() {
	>&2 echo $@
}

err() {
	log $@
	exit 1
}

[ -z "$SPN_SUPERPOSITION_URL" ] && err "SPN_SUPERPOSITION_URL not set"
[ -z "$SPN_PROXY_ADMIN_ADDR" ] && err "SPN_PROXY_ADMIN_ADDR not set"
[ -z "$SPN_ORACLE_ADDR" ] && err "SPN_ORACLE_ADDR not set"
[ -z "$SPN_FACTORY_1_IMPL" ] && err "SPN_FACTORY_1_IMPL not set"
[ -z "$SPN_FACTORY_2_IMPL" ] &&  err "SPN_FACTORY_2_IMPL not set"
[ -z "$SPN_SUPERPOSITION_KEY" ] && err "SPN_SUPERPOSITION_KEY not set"

forge script -vv \
	--broadcast \
	--json scripts/DeployFactoryProxy.s.sol \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY"
