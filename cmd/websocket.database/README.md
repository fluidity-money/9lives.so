
# websocket.database

Uses a Postgres CDC to get updates to tables we send to our users over websocket.

Warning: this code is horrible. We partly programmed this after we had a leak with Claude
and it over engineered it and took it down a crap path.

## Memory

The prices feed covers 1000+ bases; the markets use a handful. Set
`SPN_PRICES_BASES` (comma separated, e.g. `BTC,WTIOIL,DRAM`) so the
snapshot ring buffers only retain history for those bases — unset, the
buffers grow toward roughly 1.3GB. Also set `GOMEMLIMIT` (standard Go
runtime env, e.g. `GOMEMLIMIT=100MiB`) slightly under the container's
memory limit so GC pressure degrades gracefully instead of an OOM kill.
