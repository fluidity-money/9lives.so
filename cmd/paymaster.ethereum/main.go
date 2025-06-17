package main

import (
	"context"
	"database/sql"
	"log"
	"log/slog"
	"strconv"
	"time"

	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/types/events"

	_ "github.com/lib/pq"
)

const (
	EnvDatabaseUri = "SPN_DATABASE_URI"

	EnvPrivateKey = "SPN_SUPERPOSITION_KEY"

	EnvPollLifeTimeSecs = "SPN_POLL_LIFE_TIME_SECS"
)

func main() {
	pollLifetimeSecs, err := strconv.Atoi(os.Getenv(EnvPollLifeTimeSecs))
	if err != nil {
		log.Fatal("poll life time strconv: ", err)
	}
	db, err := sql.Open("postgres", os.Getenv(EnvDatabaseUri))
	if err != nil {
		log.Fatal("database open: ", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatal("database ping: ", err)
	}
	f := features.Get()
	for {
		ctx := context.WithTimeout(time.Second * pollLifeTimeSecs)
		rows, err := db.Query("SELECT * FROM ninelives_paymaster_poll_outstanding_1")
		if err != nil {
			log.Fatal("query outstanding: ", err)
		}
		defer rows.Close()
		for rows.Next() {
			err = f.On(features.FeatureShouldPriceCalldata, func() error {
				return fmt.Errorf("TODO")
			})
			if err != nil {
				slog.Error("Error estimating attempt fee", "err", err)
				continue
			}
			// We scan the id so that we may indicate the attempt to include it in a
			// Paymaster submission failed.
			var (
				id                                     int
				owner, market                          events.Address
				deadline                               events.Number
				typ                                    uint8
				permitR, permitS, calldata, r, s       events.Bytes
				permitV, v                             uint8
				maximumFee, amountToSpend, minimumBack events.Number
			)
			err = rows.Scan(
				&id,
				&owner,
				&deadline,
				&typ,
				&permitR, &permitS, &permitV,
				&market,
				&maximumFee,
				&amountToSpend,
				&minimumBack,
				&calldata,
				&v, &r, &s,
			)
			if err != nil {
				log.Fatal("scan row: ", err)
			}
		}
	}
}
