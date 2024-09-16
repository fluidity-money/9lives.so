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
[ -z "$SPN_FACTORY_IMPL" ] && err "SPN_FACTORY_IMPL not set"
[ -z "$SPN_SUPERPOSITION_KEY" ] && err "SPN_SUPERPOSITION_KEY not set"

export SPN_DEPLOY_DATA=$(cast calldata 'ctor(address)' $SPN_ORACLE_ADDR)

forge script \
	--json scripts/DeployFactoryTransparentProxy.s.sol \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY"