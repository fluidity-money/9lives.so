#!/bin/sh -eu

cat >/dev/null <<EOF
$SPN_TIMESCALE_URL
EOF

go test db_*
