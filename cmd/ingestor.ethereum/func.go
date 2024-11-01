package main

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"time"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/heartbeat"
	"github.com/fluidity-money/9lives.so/lib/setup"

	"github.com/fluidity-money/9lives.so/lib/events"
	"github.com/fluidity-money/9lives.so/lib/types"

	"gorm.io/gorm"

	"github.com/ethereum/go-ethereum"
	ethCommon "github.com/ethereum/go-ethereum/common"
	ethTypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

// FilterTopics to filter for using the Websocket/HTTP collection of logs.
var FilterTopics = []ethCommon.Hash{ // Matches any of these in the first topic position.
	events.TopicNewTrading,
	events.TopicOutcomeCreated,
	events.TopicOutcomeDecided,
	events.TopicSharesMinted,
	events.TopicPayoffActivated,
}

// Entry function, using the database to determine if polling should be
// used exclusively to receive logs, polling only for catchup, or
// exclusively websockets.
func Entry(f features.F, config config.C, ingestorPagination int, pollWait int, c *ethclient.Client, db *gorm.DB) {
	factoryAddr := ethCommon.HexToAddress(config.FactoryAddress)
	IngestPolling(
		f,
		c,
		db,
		ingestorPagination,
		pollWait,
		factoryAddr,
	)
}

// IngestPolling by repeatedly polling the Geth RPC for changes to
// receive log updates. Checks the database first to determine where the
// last point is before continuing. Assumes ethclient is HTTP.
// Uses the IngestBlockRange function to do all the lifting.
func IngestPolling(f features.F, c *ethclient.Client, db *gorm.DB, ingestorPagination, ingestorPollWait int, factoryAddress ethCommon.Address) {
	if ingestorPagination <= 0 {
		panic("bad ingestor pagination")
	}
	for {
		// Start by finding the latest block number.
		from, err := getLastBlockCheckpointed(db)
		if err != nil {
			setup.Exitf("failed to get the last block checkpoint: %v", err)
		}
		to := from + uint64(ingestorPagination)
		from++ // Increase the starting block by 1 so we always get the next block.
		slog.Info("latest block checkpoint",
			"from", from,
			"collecting until", to,
		)
		IngestBlockRange(
			f,
			c,
			db,
			factoryAddress,
			from,
			to,
		)
		slog.Info("about to sleep before polling again",
			"poll seconds", ingestorPollWait,
		)
		heartbeat.Pulse() // Report that we're alive.
		time.Sleep(time.Duration(ingestorPollWait) * time.Second)
	}
}

// IngestBlockRange using the Geth RPC provided, using the handleLog
// funciton to write records found to the database. Assumes the ethclient
// provided is a HTTP client. Also updates the underlying last block it
// saw into the database checkpoints. Fatals if something goes wrong.
func IngestBlockRange(f features.F, c *ethclient.Client, db *gorm.DB, factoryAddr ethCommon.Address, from, to uint64) {
	latestBlockNo, err := c.BlockNumber(context.Background())
	if err != nil {
		setup.Exitf("failed to get latest block number: %v", err)
	}
	logs, err := c.FilterLogs(context.Background(), ethereum.FilterQuery{
		FromBlock: new(big.Int).SetUint64(from),
		ToBlock:   new(big.Int).SetUint64(to),
		Topics:    [][]ethCommon.Hash{FilterTopics},
	})
	if err != nil {
		setup.Exitf("failed to filter logs: %v", err)
	}
	err = db.Transaction(func(db *gorm.DB) error {
		biggestBlockNo := from
		for _, l := range logs {
			if err := handleLog(db, factoryAddr, l); err != nil {
				return fmt.Errorf("failed to unpack log: %v", err)
			}
			biggestBlockNo = max(l.BlockNumber, biggestBlockNo)
		}
		// Update the checkpoint to use the latest block, if that's more than our
		// request.
		if biggestBlockNo < latestBlockNo {
			biggestBlockNo = to
		}
		// Update checkpoint here with the latest that we saw.
		if err := updateCheckpoint(db, biggestBlockNo); err != nil {
			return fmt.Errorf("failed to update a checkpoint: %v", err)
		}
		return nil
	})
	if err != nil {
		setup.Exitf("failed to ingest logs into db: %v", err)
	}
}

func handleLog(db *gorm.DB, factoryAddr ethCommon.Address, l ethTypes.Log) error {
	return handleLogCallback(
		factoryAddr,
		l,
		func(blockHash, txHash, addr string) error {
			// Track this address as a trading contract.
			return databaseTrackTrading(db, blockHash, txHash, addr)
		},
		func(addr string) (bool, error) {
			// Check if the address of the submitter is tracked by us as a trading contract.
			return databaseDoesContainTrading(db, addr)
		},
		func(t string, a any) error {
			// Use the database connection as the callback to insert this log.
			return databaseInsertLog(db, t, a)
		},
	)
}
func handleLogCallback(factoryAddr ethCommon.Address, l ethTypes.Log, cbTrackTradingContract func(blockHash, txHash, addr string) error, cbIsTrading func(addr string) (bool, error), cbInsert func(table string, l any) error) error {
	var topic1, topic2, topic3 ethCommon.Hash
	topic0 := l.Topics[0]
	if len(l.Topics) > 1 {
		topic1 = l.Topics[1]
	}
	if len(l.Topics) > 2 {
		topic2 = l.Topics[2]
	}
	if len(l.Topics) > 3 {
		topic3 = l.Topics[3]
	}
	data := l.Data
	var (
		blockHash       = l.BlockHash.String()
		transactionHash = l.TxHash.String()
		blockNumber     = l.BlockNumber
		emitterAddr     = l.Address
	)
	slog.Debug("unpacking event",
		"block hash", blockHash,
		"transaction hash", transactionHash,
		"block number", blockNumber,
		"emitter addr", emitterAddr,
		"topic0", topic0,
		"topic1", topic1,
		"topic2", topic2,
		"topic3", topic3,
	)
	logEvent := func(n string) {
		slog.Debug("event identified! unpacked",
			"event name", n,
			"block hash", blockHash,
			"transaction hash", transactionHash,
			"block number", blockNumber,
			"emitter addr", emitterAddr,
			"topic0", topic0,
			"topic1", topic1,
			"topic2", topic2,
			"topic3", topic3,
		)
	}
	// If the log emitter was the factory, then we're just going to insert whatever it produced.
	// If it wasn't, then we're going to unpack it, but we're not going to insert it until we
	// check the database to see if a row exists where the address that created the event
	// exists.
	var (
		a     any
		err   error
		table string
	)
	isFactory := factoryAddr == emitterAddr
	switch topic0 {
	case events.TopicNewTrading:
		// On top of trading this, we should track a trading contract association!
		var tradingAddr string
		a, tradingAddr, err = events.UnpackNewTrading(topic1, topic2, topic3)
		table = "ninelives_events_new_trading"
		logEvent("NewTrading")
		err := cbTrackTradingContract(blockHash, transactionHash, tradingAddr)
		if err != nil {
			return fmt.Errorf("track trading: %v", err)
		}
	case events.TopicOutcomeCreated:
		a, err = events.UnpackOutcomeCreated(topic1, topic2, topic3)
		table = "ninelives_events_outcome_created"
		logEvent("OutcomeCreated")
	case events.TopicOutcomeDecided:
		a, err = events.UnpackOutcomeDecided(topic1, topic2)
		table = "ninelives_events_outcome_decided"
		logEvent("OutcomeDecided")
	case events.TopicSharesMinted:
		a, err = events.UnpackSharesMinted(topic1, topic2, topic3, data)
		table = "ninelives_events_shares_minted"
		logEvent("SharesMinted")
	case events.TopicPayoffActivated:
		a, err = events.UnpackPayoffActivated(topic1, topic2, topic3, data)
		table = "ninelives_events_payoff_activated"
		logEvent("PayoffActivated")
	default:
		return fmt.Errorf("unexpected topic: %v", topic0)
	}
	if err != nil {
		return fmt.Errorf("failed to process topic for table %#v: %v", table, err)
	}
	setEventFields(&a, blockHash, transactionHash, blockNumber, emitterAddr.String())
	isTradingAddr, err := cbIsTrading(emitterAddr.String())
	if err != nil {

	}
	if !isFactory && !isTradingAddr {
		// The submitter was not the factory or the trading contract, we're going to
		// disregard this event.
		return nil
	}
	return cbInsert(table, a)
}

func databaseInsertLog(db *gorm.DB, table string, a any) error {
	if err := db.Table(table).Omit("CreatedBy").Create(a).Error; err != nil {
		return fmt.Errorf("inserting log: %v", err)
	}
	return nil
}

func databaseTrackTrading(db *gorm.DB, blockHash, txHash, tradingAddr string) error {
	err := db.Table("ninelives_tracked_trading_contracts_1").
		Create(types.TrackedTradingContract{
			BlockHash:       blockHash,
			TransactionHash: txHash,
			TradingAddr:     tradingAddr,
		}).
		Error
	return err
}

func databaseDoesContainTrading(db *gorm.DB, addr string) (doesExist bool, err error) {
	var count int
	err = db.Raw(`
SELECT COUNT(1) FROM ninelives_tracked_trading_contracts_1
WHERE trading_addr = ?`,
		addr,
	).
		Scan(&count).
		Error
	return count > 0, err
}

type BlockCheckpoint struct {
	ID          int
	LastUpdated time.Time
	BlockNumber uint64
}

func getLastBlockCheckpointed(db *gorm.DB) (uint64, error) {
	var c BlockCheckpoint
	err := db.Table("ninelives_ingestor_checkpointing_1").Find(&c).Error
	if err != nil {
		return 0, err
	}
	return c.BlockNumber, nil
}

func updateCheckpoint(db *gorm.DB, blockNo uint64) error {
	err := db.Table("ninelives_ingestor_checkpointing_1").
		Save(&BlockCheckpoint{1, time.Now(), blockNo}).
		Error
	return err
}
