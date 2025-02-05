#!/bin/sh

export \
	SPN_SUPERPOSITION_URL=https://testnet-rpc.superposition.so \
	SPN_FACTORY_PROXY_ADDR=0xae011e461867e825268cc3df5fa06649809828e5

./deploy-upgrade-trading-impls.sh
