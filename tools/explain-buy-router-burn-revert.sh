#!/bin/sh -e

# ALERT! This program will assume that the last program was compiled and
# staying in the wasm32-unknown-unknown target.

url=https://rpc.superposition.so

sender="$1"
cd="$2"

d="$(cast --calldata-decode 'burn(address,bytes8,uint256,uint256,uint256,address)' "$cd" \
	| sed 's/ \[[^]]*\]//g')"

trading_addr="$(echo $d | cut -f1 -d' ')"
outcome="$(echo $d | cut -f2 -d' ')"
max_share_out="$(echo $d | cut -f4 -d' ')"
referrer="$(echo $d | cut -f6 -d' ')"

>&2 echo $trading_addr
>&2 echo burned shares,fusdc returned

stylus-interpreter \
	-u "$url" \
	-a "$trading_addr" \
	-s "$sender" \
	-b "$(cast bn --rpc-url $url)" \
	contract-trading-amm-mint.wasm \
	"$(cast calldata 'burn854CC96E(bytes8,uint256,bool,uint256,address,address)' \
		"$outcome" \
		"$max_share_out" \
		true \
		0 \
		"$referrer" \
		"$sender")"
