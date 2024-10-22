#!/bin/sh -eu

proxy_admin="$1"

forge create --json \
	--rpc-url "$SPN_SUPERPOSITION_URL" \
	--private-key "$SPN_SUPERPOSITION_KEY" \
	src/FactoryProxy.sol:FactoryProxy \
	--constructor-args \
	"$proxy_admin" \
	"$SPN_FACTORY_1_IMPL_ADDR" \
	"$SPN_FACTORY_2_IMPL_ADDR" \
	$(cast calldata 'ctor(address)' $proxy_admin)
