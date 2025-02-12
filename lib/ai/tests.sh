#!/bin/sh -u

cat >/dev/null <<EOF
$SPN_MISC_AI_FUNCTION_NAME
EOF

export SPN_LISTEN_BACKEND=lambda

go test -v
