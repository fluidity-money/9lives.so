package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/fluidity-money/9lives.so/lib/config"
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

func main() {
	defer setup.Flush()
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
	cfg := cdcConfig.Config{
		Host:     u.Host,
		Username: u.User.Username(),
		Password: timescalePassword,
		Database: strings.TrimPrefix(u.Path, "/"),
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
		Logger: cdcConfig.LoggerConfig{
			LogLevel: slog.LevelDebug,
		},
	}
	broadcast := websocket.NewBroadcast()
	tableFilter := makeTableFilter()
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
		broadcast.BroadcastJson(struct {
			Table   string         `json:"table"`
			Content map[string]any `json:"content"`
		}{msg.TableName, o})
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
			sink := make(chan []byte)
			cookie := broadcast.Subscribe(sink)
			var err error
		L:
			for {
				select {
				case m := <-sink:
					outgoing <- m
				// We need a sink for all messages here:
				case <-replies:
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
			"/etc/ssl/ssl-cert-snakeoil.pem",
			"/etc/ssl/private/ssl-cert-snakeoil.key",
			nil,
		))
	}()
	defer connector.Close()
	connector.Start(ctx)
}
