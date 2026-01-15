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
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/fluidity-money/9lives.so/lib/config"
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

// EnvListenAddr to listen the HTTP server on.
const EnvListenAddr = "SPN_LISTEN_ADDR"

type TableContent struct {
	Table            string           `json:"table"`
	Content          map[string]any   `json:"content,omitempty"`
	Snapshot         []map[string]any `json:"snapshot,omitempty"`
	SnapshotToplevel []TableContent   `json:"snapshot_toplevel,omitempty"`
	encoded          []byte
}

type FilterConstraint struct {
	Gt float64 `json:"gt"`
	Lt float64 `json:"lt"`
	Et float64 `json:"et"`
}

func main() {
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
	go func() {
		t := time.NewTimer(1 * time.Minute)
		for range t.C {
			heartbeat.Pulse()
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
			Name:              "websocket_publication",
			Operations: cdcPublication.Operations{
				cdcPublication.OperationInsert,
			},
			Tables: tables,
		},
		Slot: cdcSlot.Config{
			Name:                        "websocket_slot",
			CreateIfNotExists:           true,
			SlotActivityCheckerInterval: 1000,
		},
	}
	broadcast := websocket.NewBroadcast[TableContent]()
	dumpChan := make(chan chan []TableContent)
	go func() {
		bufferMsgsChan := make(chan TableContent)
		broadcast.Subscribe(bufferMsgsChan)
		buffer := make(map[string]struct {
			i     int
			items [10]map[string]any
		})
		for {
			select {
			case v := <-bufferMsgsChan:
				x := buffer[v.Table]
				if x.i == 10 {
					x.i = 0
				}
				x.items[x.i] = v.Content
				x.i++
				buffer[v.Table] = x
			case c := <-dumpChan:
				content := make([]TableContent, len(buffer))
				i := 0
				for k, b := range buffer {
					// This is a copy:
					x := b.items
					content[i] = TableContent{
						Table:    k,
						Snapshot: x[:],
					}
					i++
				}
				c <- content
			}
		}
	}()
	tableFilter := makeTableFilter()
	encodingChan := make(chan TableContent)
	for i := 0; i < runtime.NumCPU(); i++ {
		go func() {
			for t := range encodingChan {
				e, err := json.Marshal(t)
				if err != nil {
					log.Fatalf("failed to encode: %v", err)
				}
				t.encoded = e
				broadcast.Broadcast(t)
			}
		}()
	}
	connector, err := cdc.NewConnector(ctx, cfg, func(ctx *cdcReplication.ListenerContext) {
		msg, isInsert := ctx.Message.(*cdcFormat.Insert)
		if err := ctx.Ack(); err != nil {
			setup.Exitf("ack: %v", err)
		}
		if !isInsert {
			slog.Debug("non insert received", "msg", msg, "type", fmt.Sprintf("%T", msg))
			return
		}
		validKeys := tableFilter[msg.TableName]
		if validKeys == nil {
			slog.Debug("skipping table we can't filter for", "name", msg.TableName)
			return
		}
		o := make(map[string]any, len(validKeys))
		for k, e := range validKeys {
			if e {
				o[k] = msg.Decoded[k]
			}
		}
		encodingChan <- TableContent{msg.TableName, o, nil, nil, nil}
	})
	if err != nil {
		setup.Exitf("error opening connector: %v", err)
	}
	go func() {
		websocket.Endpoint("/", func(
			ipAddr string, query url.Values,
			replies <-chan []byte, outgoing chan<- []byte,
			shutdown chan<- error, requestShutdown <-chan bool,
		) {
			sink := make(chan TableContent)
			go func() {
				snapshotChan := make(chan []TableContent)
				dumpChan <- snapshotChan
				snapshot, err := json.Marshal(TableContent{
					SnapshotToplevel: <-snapshotChan,
				})
				if err != nil {
					slog.Error("failed to marshal snapshot", "err", err)
				}
				outgoing <- snapshot
			}()
			cookie := broadcast.Subscribe(sink)
			filterRules := make(map[string]map[string]FilterConstraint)
			var err error
		L:
			for {
				select {
				case m := <-sink:
					outgoing <- m.encoded
				// We need a sink for all messages here:
				case msg := <-replies:
					var filterReq struct {
						Add []struct {
							Table  string `json:"table"`
							Fields []struct {
								Name        string           `json:"name"`
								Constraints FilterConstraint `json:"filter_constraints"`
							} `json:"fields"`
						} `json:"add"`
					}
					if err := json.Unmarshal(msg, &filterReq); err != nil {
						slog.Error("bad message received", "err", err)
						break L
					}
					for _, ch := range filterReq.Add {
						t := ch.Table
						if filterRules[t] == nil {
							filterRules[t] = make(map[string]FilterConstraint)
						}

					}
				case done := <-requestShutdown:
					if done {
						slog.Error("shutdown requested", "err", err)
						break L
					}
				}
			}
			broadcast.Unsubscribe(cookie)
			shutdown <- err
		})
		setup.Exitf("bind: %v", http.ListenAndServeTLS(
			os.Getenv(EnvListenAddr),
			"/etc/ssl/certs/ssl-cert-snakeoil.pem",
			"/etc/ssl/private/ssl-cert-snakeoil.key",
			nil,
		))
	}()
	defer connector.Close()
	connector.Start(ctx)
}
