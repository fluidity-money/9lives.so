package main

import (
	"context"
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

func (pb *partitionedBuffer) allItems() []map[string]any {
	var out []map[string]any
	for _, rb := range pb.buffers {
		snapshot := make([]map[string]any, PrivateSnapshotLookback)
		copy(snapshot, rb.items[:])
		for _, item := range snapshot {
			if item != nil {
				out = append(out, item)
			}
		}
	}
	return out
}

func compareFmt(v1, v2 any) bool {
	if v1 == v2 {
		return true
	}
	return fmt.Sprintf("%v", v1) == fmt.Sprintf("%v", v2)
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
	ctx := context.Background()
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
		for range t.C {
			heartbeat.Pulse()
			t.Reset(time.Minute)
		}
	}()
	cfg := cdcConfig.Config{
		Host:     u.Hostname(),
		Username: u.User.Username(),
		Password: timescalePassword,
		Database: strings.TrimPrefix(u.Path, "/"),
		Port:     port,
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
	go func() {
		bufferMsgsChan := make(chan TableContent)
		broadcast.Subscribe(bufferMsgsChan)
	}()

	tableFilter := makeTableFilter()

	connector, err := cdc.NewConnector(ctx, cfg, func(ctx *cdcReplication.ListenerContext) {
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
			sink := make(chan TableContent)
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

				case m := <-sink:
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
					}

				case msg := <-replies:
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

				case done := <-requestShutdown:
					if done {
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
	connector.Start(ctx)
}
