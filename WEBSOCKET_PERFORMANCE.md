# websocket.database performance investigation

2026-07-09. Investigated live against the deployed service using the Go
debug endpoint at `https://websocket.9lives.so/debug/pprof/` (note: that
endpoint is publicly reachable — worth restricting separately), plus two
measurement clients: a subscribed websocket connection recording
`created_by` → delivery lag per row, and a counter of per-table message
and byte rates. No code was changed as part of this investigation.

## Symptom

After a while the service takes progressively longer to deliver rows to
subscribed clients, and it is currently being killed and restarted every
few minutes as a workaround. Every restart also wipes the snapshot
buffer, which is why charts keep losing their history.

## Measurements

**Delivery latency climbs within a single process lifetime.** Over one
~5 minute lifetime, the probe's per-row lag went from p50 47ms / p90
68ms in the first minutes to p50 186ms / p90 319ms in the final minute
before the process died. Fresh process, low lag again — repeating.

**Process lifetimes observed: ~2–7 minutes.** Probe connections died at
118s and 298s; `TotalAlloc` resets and goroutine ages confirm restarts
at the same cadence. `MaxRSS` reaches ~120–125MB right before each
death, consistent with an OOM kill at a ~128MB limit.

**The prices feed is ~135–285 rows/second across 1,157 distinct
`base` values.** Measured 8,101 prices-table messages in one 60s window
and 5,708 in one 20s window; a 20s sample of `content.base` counted
1,157 distinct assets (the whole exchange universe — every perp, spot
index, and stock proxy). The product's short-term markets use ~3 of
them (BTC, WTIOIL, DRAM).

**The snapshot ring buffers dominate the heap and grow linearly.**
`main.(*partitionedBuffer).insert` retains 63–68% of the heap:
31.7MB at ~90s into one cycle, 39.7MB later in another — roughly 290B
retained per row (each row is stored as a decoded `map[string]any`).
The rings cap at 4,000 rows *per base*, so the steady state is

    1,157 bases × 4,000 rows × ~290B  ≈  1.3GB

inside a ~128MB container. The process is killed while the rings are
still filling; it can never reach steady state. At ~0.25 rows/s per
asset, 4,000 rows is also ~4.4 hours of history per asset — far more
than the longest market window.

**The snapshot buffer intake is saturated.** The buffer goroutine's
inbound channel (capacity 6,000) sits full — 12.5MB of queued
`TableContent` in the heap profile — meaning snapshots lag the live
stream by ~20 seconds at current row rates, and the broadcast loop
drops buffer-bound messages whenever it stays full.

**CPU is not the bottleneck today, but the fan-out pattern is wasteful.**
A 30s CPU profile at 22 connections shows only ~5% CPU, dominated by
`selectgo`/`futex` scheduler churn: every connection's sink channel
receives every row of every table (~285 sends/s each) and the handler
filters after waking. Wakeups scale as rows × connections.

## Root cause

The ring-buffer subsystem retains the last 4,000 decoded rows for
**every** partition of **every** table, but the prices firehose covers
1,157 assets while the markets use ~3. Over 99.7% of retained memory
serves no user. Combined with the per-row overhead of `map[string]any`,
retained heap grows by tens of MB per minute toward a ~1.3GB steady
state that the container cannot hold. As the live set grows, GC work
grows with it — that is the climbing delivery latency — until the
process is killed, the buffer starts empty again, and the cycle repeats.

## Suggested approaches, ranked

1. **Buffer only the assets the markets use.** Skip the ring insert for
   prices rows whose `base` isn't in an allowlist (env var, or derived
   from the live campaigns). One conditional in the buffer goroutine.
   Cuts retained memory by ~99.7% (~1.3GB → a few MB), which removes
   the OOM cycle, the GC-driven latency climb, and the restart-driven
   history loss all at once. Live broadcast behavior is unchanged;
   snapshots for used assets are unchanged.

2. **Store compact rows in the rings.** Replace the retained
   `map[string]any` with a small struct (or the already-encoded JSON
   bytes produced for broadcast) — several times less memory per row,
   and snapshot responses can splice pre-encoded rows instead of
   re-marshalling up to 4,000 maps per request. Worth doing with (1),
   sufficient on its own only if the allowlist is unacceptable.

3. **Bound rings by time, not just count.** 4,000 rows ≈ 4.4h per asset
   at current rates; markets run at most ~1 day but charts only need the
   campaign window. A time cap matching the longest market keeps rings
   right-sized however the tick rate changes.

4. **Route broadcasts by table/partition.** Give the broadcast per-table
   (or per-base) subscriber lists so a connection only wakes for rows it
   subscribed to. Cuts per-connection wakeups from ~285/s to the
   asset's own tick rate, and stops the buffer goroutine competing with
   a saturated intake — snapshot lag drops from ~20s to real time.
   Medium-sized change; matters as connection count grows.

5. **Safety nets.** `GOMEMLIMIT` slightly under the container limit
   turns a hard OOM into graceful GC pressure. A write deadline on
   client writes (open PR #89) prevents a stalled client from wedging
   its writer goroutine permanently — a separate, smaller leak class
   than the ring growth, but the fix is two lines.

6. **Bigger option: drop in-memory history.** Serve chart snapshots
   from the database with an indexed per-base query and keep the
   websocket purely live. Removes the ring memory entirely at the cost
   of one small DB read per connection. Only worth it if (1)–(3) are
   deemed insufficient.

Expected effect of (1) alone: rings hold ~3 assets × 4,000 rows ≈ a few
MB, the process becomes long-lived, latency stays flat, the kill
workaround becomes unnecessary, and charts keep their full history.

## Reproducing the measurements

```sh
# heap: who retains memory
curl -s "https://websocket.9lives.so/debug/pprof/heap" -o heap.pb.gz
go tool pprof -top -inuse_space heap.pb.gz

# goroutines with ages / states
curl -s "https://websocket.9lives.so/debug/pprof/goroutine?debug=2"

# 30s CPU profile
curl -s "https://websocket.9lives.so/debug/pprof/profile?seconds=30" -o cpu.pb.gz
go tool pprof -top cpu.pb.gz
```

Per-table rates and delivery lag were measured with a plain websocket
client subscribing via `{"add":[{"table":"oracles_ninelives_prices_2"}]}`
and comparing each row's `created_by` to arrival time.
