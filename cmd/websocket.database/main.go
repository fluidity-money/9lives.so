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
	"github.com/fluidity-money/9lives.so/lib/heartbeat"
	"github.com/fluidity-money/9lives.so/lib/setup"
	"github.com/fluidity-money/9lives.so/lib/websocket"

	_ "github.com/lib/pq"

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

const MaxFilters = 10

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

func compareFmt(v1, v2 any) bool {
	if v1 == v2 {
		return true
	}
	return fmt.Sprintf("%v", v1) == fmt.Sprintf("%v", v2)
}

func main() {
	config := config.Get()
	u, err := url.Parse(config.PickTimescaleUrl())
	if err != nil {
		setup.Exitf("parse error: %v", err)
	}
	publicationSlot := os.Getenv(EnvPublicationSlot)
	if publicationSlot == "" {
		setup.Exitf("empty %v", EnvPublicationSlot)
	}
	db, err := sql.Open("postgres", config.PickTimescaleUrl())
	if err != nil {
		setup.Exitf("database: %v", err)
	}
	defer db.Close()
	_, err = db.Exec(`
SELECT pg_replication_slot_advance($1, pg_current_wal_lsn())`,
		publicationSlot,
	)
	if err != nil {
		setup.Exitf("update slot: %v", err)
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
		Host:      u.Hostname(),
		Username:  u.User.Username(),
		Password:  timescalePassword,
		Database:  strings.TrimPrefix(u.Path, "/"),
		Port:      port,
		DebugMode: false,
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
			Name:                        publicationSlot,
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
			var shouldShutdown bool
		L:
			for {
				if shouldShutdown {
					broadcast.Unsubscribe(cookie)
				}
				select {
				case <-connCtx.Done():
					slog.Debug("connection context cancelled",
						"ip", ipAddr,
					)
					break L
				case m := <-sink:
					if !filterRulesSet[m.Table] {
						continue L
					}
					for k, c := range filterRules[m.Table] {
						v, exists := m.Content[k]
						if !exists || !compareFmt(v, c.Et) {
							continue L
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
					// TODO: we only support a single snapshot table:
					if len(req.AskForSnapshot) > 1 {
						shouldShutdown = true
						continue
					}
					args := make([]any, 1)
					for _, ch := range req.AskForSnapshot {
						args = append(args, ch.Table)
						for _, f := range ch.Fields {
							c := f.Name
							// Currently we only support strings (TODO):
							v := f.Constraints.Et
							args= append(append(args, c), v)
						}
						query := formatSql(args)
						rows, err := db.Query(query, args...)
						if err != nil {
							slog.Error("bad query", "err", err, "sql", query)
							shouldShutdown = true
							continue
						}
						defer rows.Close()
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
