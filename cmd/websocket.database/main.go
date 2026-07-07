package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/heartbeat"
	"github.com/fluidity-money/9lives.so/lib/setup"
	"github.com/fluidity-money/9lives.so/lib/websocket"

	cdc "github.com/Trendyol/go-pq-cdc"
	cdcConfig "github.com/Trendyol/go-pq-cdc/config"
	cdcFormat "github.com/Trendyol/go-pq-cdc/pq/message/format"
	cdcPublication "github.com/Trendyol/go-pq-cdc/pq/publication"
	cdcReplication "github.com/Trendyol/go-pq-cdc/pq/replication"
	cdcSlot "github.com/Trendyol/go-pq-cdc/pq/slot"

	_ "github.com/jackc/pgx/v5/stdlib"
)

const (
	EnvListenAddr            = "SPN_LISTEN_ADDR"
	EnvPublicationName       = "SPN_PUBLICATION_NAME"
	EnvPublicationSlot       = "SPN_PUBLICATION_SLOT"
	EnvPublicationMetricSlot = "SPN_PUBLICATION_PORT"
)

const PrivateSnapshotLookback = 4000

const PricesTable = "oracles_ninelives_prices_2"
const PricesPartitionKey = "base"

type TableContent struct {
	Table            string           `json:"table"`
	Content          map[string]any   `json:"content,omitempty"`
	Snapshot         []map[string]any `json:"snapshot,omitempty"`
	SnapshotToplevel []TableContent   `json:"snapshot_toplevel,omitempty"`
	encoded          []byte
}

type FilterConstraint struct {
	Et any `json:"et"`
}

type ringBuffer struct {
	i     int
	items [PrivateSnapshotLookback]map[string]any
}

type partitionedBuffer struct {
	buffers map[string]*ringBuffer
}

// dumpRequest wraps the snapshot reply channel with a context so the
// buffer goroutine can abandon the send when the requester is gone.
type dumpRequest struct {
	ctx   context.Context
	reply chan []TableContent
}

func newPartitionedBuffer() *partitionedBuffer {
	return &partitionedBuffer{buffers: make(map[string]*ringBuffer)}
}

func (pb *partitionedBuffer) insert(partitionKey string, content map[string]any) {
	x := pb.buffers[partitionKey]
	if x == nil {
		x = &ringBuffer{}
		pb.buffers[partitionKey] = x
	}
	if x.i == PrivateSnapshotLookback {
		x.i = 0
	}
	x.items[x.i] = content
	x.i++
}

// itemsInOrder returns the buffered items oldest first. rb.i is the
// next write position, so once the ring has wrapped the slots from
// rb.i onwards hold the oldest entries.
func (rb *ringBuffer) itemsInOrder() []map[string]any {
	start := rb.i % PrivateSnapshotLookback
	out := make([]map[string]any, 0, PrivateSnapshotLookback)
	for j := 0; j < PrivateSnapshotLookback; j++ {
		if item := rb.items[(start+j)%PrivateSnapshotLookback]; item != nil {
			out = append(out, item)
		}
	}
	return out
}

func (pb *partitionedBuffer) allItems() []map[string]any {
	var out []map[string]any
	for _, rb := range pb.buffers {
		out = append(out, rb.itemsInOrder()...)
	}
	return out
}

func compareFmt(v1, v2 any) bool {
	if v1 == v2 {
		return true
	}
	return fmt.Sprintf("%v", v1) == fmt.Sprintf("%v", v2)
}

// loadRecentPrices fetches the most recent price rows per asset from
// the database, oldest first, shaped like the CDC-decoded rows the
// buffer normally receives. The ring buffer is memory-only, so
// without this every restart of this process would leave snapshots
// with no history until it re-accumulates from the live stream.
func loadRecentPrices(ctx context.Context, timescaleUrl string) ([]map[string]any, error) {
	ctx, cancel := context.WithTimeout(ctx, time.Minute)
	defer cancel()
	db, err := sql.Open("pgx", timescaleUrl)
	if err != nil {
		return nil, fmt.Errorf("open: %w", err)
	}
	defer db.Close()
	rows, err := db.QueryContext(ctx, `
	select p.id, p.base, p.amount, p.created_by
	from (select distinct base from `+PricesTable+`) b
	cross join lateral (
	    select id, base, amount, created_by
	    from `+PricesTable+`
	    where base = b.base
	    order by created_by desc
	    limit $1
	) p
	order by p.created_by asc
	`, PrivateSnapshotLookback)
	if err != nil {
		return nil, fmt.Errorf("query: %w", err)
	}
	defer rows.Close()
	var out []map[string]any
	for rows.Next() {
		var (
			id        int64
			base      string
			amount    float64
			createdBy time.Time
		)
		if err := rows.Scan(&id, &base, &amount, &createdBy); err != nil {
			return nil, fmt.Errorf("scan: %w", err)
		}
		out = append(out, map[string]any{
			"id":         id,
			"base":       base,
			"amount":     amount,
			"created_by": createdBy,
		})
	}
	return out, rows.Err()
}

func main() {
	f := features.Get()
	config := config.Get()

	u, err := url.Parse(config.PickTimescaleUrl())
	if err != nil {
		setup.Exitf("parse error: %v", err)
	}

	if u.User == nil {
		setup.Exitf("timescale url has no username")
	}

	// masterCtx is cancelled when the process is shutting down.
	// Every long-lived goroutine should watch it.
	masterCtx, masterCancel := context.WithCancel(context.Background())
	defer masterCancel()

	tables := getTables()

	timescalePassword, _ := u.User.Password()

	var port int
	if p := u.Port(); p != "" {
		if port, err = strconv.Atoi(strings.TrimPrefix(u.Port(), ":")); err != nil {
			setup.Exitf("bad port: %v", u.Port())
		}
	} else {
		port = 5432
	}

	metricPort, err := strconv.Atoi(os.Getenv(EnvPublicationMetricSlot))
	if err != nil {
		setup.Exitf("metric slot: %v", err)
	}

	go func() {
		t := time.NewTicker(time.Minute)
		defer t.Stop()
		for {
			select {
			case <-masterCtx.Done():
				return
			case <-t.C:
				heartbeat.Pulse()
				t.Reset(time.Minute)
			}
		}
	}()

	cfg := cdcConfig.Config{
		Host:     u.Hostname(),
		Username: u.User.Username(),
		Password: timescalePassword,
		Database: strings.TrimPrefix(u.Path, "/"),
		Port:     port,
		ExtensionSupport: cdcConfig.ExtensionSupport{
			EnableTimeScaleDB: true,
		},
		Publication: cdcPublication.Config{
			CreateIfNotExists: true,
			Name:              os.Getenv(EnvPublicationName),
			Operations: cdcPublication.Operations{
				cdcPublication.OperationInsert,
			},
			Tables: tables,
		},
		Metric: cdcConfig.MetricConfig{
			Port: metricPort,
		},
		Slot: cdcSlot.Config{
			Name:                        os.Getenv(EnvPublicationSlot),
			CreateIfNotExists:           true,
			SlotActivityCheckerInterval: 1000,
		},
	}

	broadcast := websocket.NewBroadcast[TableContent]()

	dumpChan := make(chan dumpRequest)

	// Seed the prices buffer from the database so snapshots are
	// complete immediately after a restart. Failure is non-fatal: we
	// fall back to accumulating from the live stream only. The CDC
	// slot may re-deliver some backfilled rows; clients dedupe by id.
	backfill, err := loadRecentPrices(masterCtx, config.PickTimescaleUrl())
	if err != nil {
		slog.Warn("failed to backfill prices from the database",
			"err", err,
		)
	} else {
		slog.Info("backfilled prices from the database",
			"rows", len(backfill),
		)
	}

	go func() {
		bufferMsgsChan := make(chan TableContent, 100*60)
		bufferCookie := broadcast.Subscribe(bufferMsgsChan)

		// Clean up when this goroutine exits.
		defer broadcast.Unsubscribe(bufferCookie)

		buffer := make(map[string]*partitionedBuffer)

		for _, row := range backfill {
			pb := buffer[PricesTable]
			if pb == nil {
				pb = newPartitionedBuffer()
				buffer[PricesTable] = pb
			}
			if base, ok := row[PricesPartitionKey]; ok {
				pb.insert(fmt.Sprintf("%v", base), row)
			}
		}

		for {
			select {
			case <-masterCtx.Done():
				return

			case v, ok := <-bufferMsgsChan:
				if !ok {
					return
				}
				pb := buffer[v.Table]
				if pb == nil {
					pb = newPartitionedBuffer()
					buffer[v.Table] = pb
				}

				partitionKey := ""
				if v.Table == PricesTable {
					if base, ok := v.Content[PricesPartitionKey]; ok {
						partitionKey = fmt.Sprintf("%v", base)
					}
				}

				pb.insert(partitionKey, v.Content)

			case req, ok := <-dumpChan:
				if !ok {
					return
				}
				content := make([]TableContent, 0, len(buffer))
				for k, pb := range buffer {
					content = append(content, TableContent{
						Table:    k,
						Snapshot: pb.allItems(),
					})
				}
				// Send the snapshot, but give up if the requester's
				// context is already cancelled.
				select {
				case req.reply <- content:
				case <-req.ctx.Done():
				case <-masterCtx.Done():
				}
				close(req.reply)
			}
		}
	}()

	tableFilter := makeTableFilter()

	connector, err := cdc.NewConnector(masterCtx, cfg, func(ctx *cdcReplication.ListenerContext) {
		msg, isInsert := ctx.Message.(*cdcFormat.Insert)
		if err := ctx.Ack(); err != nil {
			setup.Exitf("ack: %v", err)
		}

		if !isInsert {
			slog.Debug("non insert received",
				"msg", msg,
				"type", fmt.Sprintf("%T", msg))
			return
		}

		validKeys := tableFilter[msg.TableName]
		if validKeys == nil {
			slog.Debug("skipping table we can't filter for",
				"name", msg.TableName)
			return
		}

		o := make(map[string]any, len(validKeys))
		for k, e := range validKeys {
			if e {
				o[k] = msg.Decoded[k]
			}
		}

		m := TableContent{msg.TableName, o, nil, nil, nil}
		e, err := json.Marshal(m)
		if err != nil {
			log.Fatalf("failed to encode: %v", err)
		}
		m.encoded = e

		broadcast.Broadcast(m)
	})
	if err != nil {
		setup.Exitf("error opening connector: %v", err)
	}

	go func() {
		websocket.Endpoint("/", func(
			connCtx context.Context,
			ipAddr string,
			query url.Values,
			replies <-chan []byte,
			outgoing chan<- []byte,
			shutdown chan<- error,
			requestShutdown <-chan bool,
		) {
			sink := make(chan TableContent, 5*60)
			cookie := broadcast.Subscribe(sink)
			defer broadcast.Unsubscribe(cookie)

			filterRules := make(map[string]map[string]*FilterConstraint)
			filterRulesSet := make(map[string]bool)

		L:
			for {
				select {
				case <-connCtx.Done():
					slog.Debug("connection context cancelled",
						"ip", ipAddr,
					)
					break L

				case <-masterCtx.Done():
					slog.Debug("master context cancelled, tearing down connection",
						"ip", ipAddr,
					)
					break L

				case m, ok := <-sink:
					if !ok {
						break L
					}
					if f.Is(features.FeatureFilterTables) {
						if !filterRulesSet[m.Table] {
							continue L
						}
						for k, c := range filterRules[m.Table] {
							v, exists := m.Content[k]
							if !exists || !compareFmt(v, c.Et) {
								continue L
							}
						}
					}
					select {
					case outgoing <- m.encoded:
					case <-connCtx.Done():
						break L
					case <-masterCtx.Done():
						break L
					default:
						slog.Warn("outgoing channel full, dropping message",
							"ip", ipAddr,
							"table", m.Table,
						)
					}

				case msg, ok := <-replies:
					if !ok {
						break L
					}
					var req struct {
						AskForSnapshot []struct {
							Table  string `json:"table"`
							Fields []struct {
								Name        string           `json:"name"`
								Constraints FilterConstraint `json:"filter_constraints"`
							} `json:"fields"`
						} `json:"ask_for_snapshot"`
						FilterReq []struct {
							Table  string `json:"table"`
							Fields []struct {
								Name        string           `json:"name"`
								Constraints FilterConstraint `json:"filter_constraints"`
							} `json:"fields"`
						} `json:"add"`
					}

					if err := json.Unmarshal(msg, &req); err != nil {
						slog.Error("bad message received", "err", err)
						break L
					}

					if len(req.AskForSnapshot) > 0 {
						snapshotFilters := make(map[string]map[string]*FilterConstraint)
						for _, ch := range req.AskForSnapshot {
							t := ch.Table
							if snapshotFilters[t] == nil {
								snapshotFilters[t] = make(map[string]*FilterConstraint)
							}
							for _, field := range ch.Fields {
								c := field.Constraints
								snapshotFilters[t][field.Name] = &c
							}
						}

						go func() {
							replyChan := make(chan []TableContent)

							// Send the dump request, giving up if the
							// connection or process is shutting down.
							select {
							case dumpChan <- dumpRequest{ctx: connCtx, reply: replyChan}:
							case <-connCtx.Done():
								return
							case <-masterCtx.Done():
								return
							}

							// Wait for the buffer goroutine to respond.
							var rawSnapshot []TableContent
							select {
							case s, ok := <-replyChan:
								if !ok {
									// The buffer goroutine closed the
									// channel without sending (requester
									// context was cancelled).
									return
								}
								rawSnapshot = s
							case <-connCtx.Done():
								return
							case <-masterCtx.Done():
								return
							}

							var filteredSnapshot []TableContent
							for _, tableContent := range rawSnapshot {
								tableFilter, requested := snapshotFilters[tableContent.Table]
								if !requested {
									continue
								}

								var filteredItems []map[string]any
								for _, item := range tableContent.Snapshot {
									if item == nil {
										continue
									}
									include := true
									for k, c := range tableFilter {
										v, exists := item[k]
										if !exists || !compareFmt(v, c.Et) {
											include = false
											break
										}
									}
									if include {
										filteredItems = append(filteredItems, item)
									}
								}

								if len(filteredItems) > 0 {
									filteredSnapshot = append(filteredSnapshot, TableContent{
										Table:    tableContent.Table,
										Snapshot: filteredItems,
									})
								}
							}

							snapshot, err := json.Marshal(TableContent{
								SnapshotToplevel: filteredSnapshot,
							})
							if err != nil {
								slog.Error("failed to marshal snapshot", "err", err)
								return
							}

							select {
							case outgoing <- snapshot:
							case <-connCtx.Done():
								slog.Debug("connection gone before snapshot could be sent",
									"ip", ipAddr,
								)
							case <-masterCtx.Done():
							}
						}()
					}

					for _, ch := range req.FilterReq {
						t := ch.Table
						if filterRules[t] == nil {
							filterRules[t] = make(map[string]*FilterConstraint)
						}
						filterRulesSet[t] = true
						for _, field := range ch.Fields {
							c := field.Constraints
							filterRules[t][field.Name] = &c
						}
					}

				case done, ok := <-requestShutdown:
					if !ok || done {
						slog.Debug("shutdown requested by framework",
							"ip", ipAddr,
						)
						break L
					}
				}
			}

			select {
			case shutdown <- nil:
			default:
			}
		})

		setup.Exitf("bind: %v", http.ListenAndServe(
			os.Getenv(EnvListenAddr),
			nil,
		))
	}()

	defer connector.Close()
	connector.Start(masterCtx)
}
