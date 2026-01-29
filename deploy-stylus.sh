#!/bin/sh -eu

wasm_file="$1"

if ! which bobcat-deploy >/dev/null; then
	>&2 echo bobcat-deploy not in PATH
	exit 2
fi

bobcat-deploy \
	"$SPN_SUPERPOSITION_URL" \
	"$SPN_SUPERPOSITION_KEY" $1
