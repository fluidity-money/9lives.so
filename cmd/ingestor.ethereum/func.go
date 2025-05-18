package main

import (
	"context"
	"fmt"
	"log/slog"
	"math/big"
	"strings"
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
	events.TopicNewTrading2,
	events.TopicOutcomeCreated,
	events.TopicOutcomeDecided,
	events.TopicSharesMinted,
	events.TopicSharesBurned,
	events.TopicPayoffActivated,
	events.TopicDeadlineExtension,
	events.TopicMarketCreated2,
	events.TopicCallMade,
	events.TopicInfraMarketClosed,
	events.TopicDAOMoneyDistributed,
	events.TopicCommitted,
	events.TopicCommitmentRevealed,
	events.TopicWhinged,
	events.TopicCampaignEscaped,
	events.TopicLockedUp,
	events.TopicWithdrew,
	events.TopicSlashed,
	events.TopicFrozen,
	events.TopicRequested,
	events.TopicConcluded,
	events.TopicLiquidityAdded,
	events.TopicLiquidityAddedSharesSent,
	events.TopicLiquidityRemoved,
	events.TopicLiquidityRemovedSharesSent,
	events.TopicLiquidityClaimed,
	events.TopicLPFeesClaimed,
	events.TopicAddressFeesClaimed,
	events.TopicReferrerEarnedFees,
}

// Entry function, using the database to determine if polling should be
// used exclusively to receive logs, polling only for catchup, or
// exclusively websockets.
func Entry(f features.F, config config.C, ingestorPagination int, pollWait int, c *ethclient.Client, db *gorm.DB) {
	var (
		factoryAddr            = ethCommon.HexToAddress(config.FactoryAddress)
		infraMarketAddr        = ethCommon.HexToAddress(config.InfraMarketAddress)
		lockupAddr             = ethCommon.HexToAddress(config.LockupAddress)
		sarpAiSignallerAddress = ethCommon.HexToAddress(config.SarpAiSignallerAddress)
	)
	IngestPolling(
		f,
		c,
		db,
		ingestorPagination,
		pollWait,
		factoryAddr,
		infraMarketAddr,
		lockupAddr,
		sarpAiSignallerAddress,
	)
}

// IngestPolling by repeatedly polling the Geth RPC for changes to
// receive log updates. Checks the database first to determine where the
// last point is before continuing. Assumes ethclient is HTTP.
// Uses the IngestBlockRange function to do all the lifting.
func IngestPolling(f features.F, c *ethclient.Client, db *gorm.DB, ingestorPagination, ingestorPollWait int, factoryAddress, infraMarketAddress, lockupAddress, sarpAiSignallerAddress ethCommon.Address) {
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
		slog.Info("latest block checkpoint",
			"from", from,
			"collecting until", to,
		)
		IngestBlockRange(
			f,
			c,
			db,
			factoryAddress,
			infraMarketAddress,
			lockupAddress,
			sarpAiSignallerAddress,
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
func IngestBlockRange(f features.F, c *ethclient.Client, db *gorm.DB, factoryAddr, infraMarket, lockupAddr, sarpSignallerAiAddr ethCommon.Address, from, to uint64) {
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
		var (
			hasChanged bool
			err        error
		)
		for _, l := range logs {
			hasChanged, err = handleLog(
				f,
				db,
				factoryAddr,
				infraMarket,
				lockupAddr,
				sarpSignallerAiAddr,
				l,
			)
			if err != nil {
				return fmt.Errorf("failed to unpack log: %v", err)
			}
			biggestBlockNo = max(l.BlockNumber, biggestBlockNo)
		}
		// Update the checkpoint to use the latest block, if that's more than our
		// request.
		if hasChanged {
			biggestBlockNo++
		}
		if to < latestBlockNo {
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

func handleLog(f features.F, db *gorm.DB, factoryAddr, infraMarketAddr, lockupAddr, sarpSignallerAiAddr ethCommon.Address, l ethTypes.Log) (bool, error) {
	return handleLogCallback(
		factoryAddr,
		infraMarketAddr,
		lockupAddr,
		sarpSignallerAiAddr,
		l,
		func(blockHash, txHash, addr string) error {
			// Track this address as a trading contract.
			return databaseTrackTrading(db, blockHash, txHash, addr)
		},
		func(addr string) (bool, error) {
			// Check if the address of the submitter is tracked by us as a trading contract.
			if f.Is(features.FeatureShouldCheckIfTrackedFirst) {
				return databaseDoesContainTrading(db, addr)
			} else {
				// It's useful to optionally be ultra permissive, since there's a race
				// condition where the same block contains the creation, and the share
				// minting, then the logs come out disordered. It might be better to
				// simply accept everything and do filtering after the fact.
				return true, nil
			}
		},
		func(t string, a any) error {
			// Use the database connection as the callback to insert this log.
			return databaseInsertLog(db, t, a)
		},
	)
}
func handleLogCallback(factoryAddr, infraMarketAddr, lockupAddr, sarpSignallerAiAddr ethCommon.Address, l ethTypes.Log, cbTrackTradingContract func(blockHash, txHash, addr string) error, cbIsTrading func(addr string) (bool, error), cbInsert func(table string, l any) error) (bool, error) {
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
	var fromTrading bool
	switch topic0 {
	case events.TopicNewTrading2:
		// On top of trading this, we should track a trading contract association!
		var tradingAddr string
		a, tradingAddr, err = events.UnpackNewTrading2(topic1, topic2, topic3, data)
		table = "ninelives_events_new_trading2"
		logEvent("NewTrading2")
		err := cbTrackTradingContract(blockHash, transactionHash, tradingAddr)
		if err != nil {
			return false, fmt.Errorf("track trading2: %v", err)
		}
	case events.TopicOutcomeCreated:
		a, err = events.UnpackOutcomeCreated(topic1, topic2, topic3)
		table = "ninelives_events_outcome_created"
		logEvent("OutcomeCreated")
	case events.TopicOutcomeDecided:
		a, err = events.UnpackOutcomeDecided(topic1, topic2)
		table = "ninelives_events_outcome_decided"
		logEvent("OutcomeDecided")
		fromTrading = true
	case events.TopicSharesMinted:
		a, err = events.UnpackSharesMinted(topic1, topic2, topic3, data)
		table = "ninelives_events_shares_minted"
		logEvent("SharesMinted")
		fromTrading = true
	case events.TopicSharesBurned:
		a, err = events.UnpackSharesBurned(topic1, topic2, topic3, data)
		table = "ninelives_events_shares_burned"
		logEvent("SharesBurned")
		fromTrading = true
	case events.TopicPayoffActivated:
		a, err = events.UnpackPayoffActivated(topic1, topic2, topic3, data)
		table = "ninelives_events_payoff_activated"
		logEvent("PayoffActivated")
		fromTrading = true
	case events.TopicDeadlineExtension:
		a, err = events.UnpackDeadlineExtension(topic1, topic2)
		table = "ninelives_events_deadline_extension"
		logEvent("DeadlineExtension")
		fromTrading = true
	case events.TopicMarketCreated2:
		a, err = events.UnpackMarketCreated2(topic1, topic2, topic3, data)
		table = "ninelives_events_market_created2"
		logEvent("MarketCreated2")
	case events.TopicCallMade:
		a, err = events.UnpackCallMade(topic1, topic2, topic3)
		table = "ninelives_events_call_made"
		logEvent("CallMade")
	case events.TopicInfraMarketClosed:
		a, err = events.UnpackInfraMarketClosed(topic1, topic2, topic3)
		table = "ninelives_events_infra_market_closed"
		logEvent("InfraMarketClosed")
	case events.TopicDAOMoneyDistributed:
		a, err = events.UnpackDAOMoneyDistributed(topic1, topic2, topic3)
		table = "ninelives_events_dao_money_distributed"
		logEvent("DAOMoneyDistributed")
	case events.TopicCommitted:
		a, err = events.UnpackCommitted(topic1, topic2, topic3)
		table = "ninelives_events_committed"
		logEvent("Committed")
	case events.TopicCommitmentRevealed:
		a, err = events.UnpackCommitmentRevealed(topic1, topic2, topic3, data)
		table = "ninelives_events_commitment_revealed"
		logEvent("CommitmentRevealed")
	case events.TopicWhinged:
		a, err = events.UnpackWhinged(topic1, topic2, topic3)
		table = "ninelives_events_whinged"
		logEvent("Whinged")
	case events.TopicCampaignEscaped:
		a, err = events.UnpackCampaignEscaped(topic1)
		table = "ninelives_events_campaign_escaped"
		logEvent("CampaignEscaped")
	case events.TopicLockedUp:
		a, err = events.UnpackLockedUp(topic1, topic2)
		table = "ninelives_events_locked_up"
		logEvent("LockedUp")
	case events.TopicDeclared:
		a, err = events.UnpackDeclared(topic1, topic2, topic3)
		table = "ninelives_events_declared"
		logEvent("Declared")
	case events.TopicWithdrew:
		a, err = events.UnpackWithdrew(topic1, topic2)
		table = "ninelives_events_withdrew"
		logEvent("Withdrew")
	case events.TopicSlashed:
		a, err = events.UnpackSlashed(topic1, topic2, topic3)
		table = "ninelives_events_slashed"
		logEvent("Slashed")
	case events.TopicFrozen:
		a, err = events.UnpackFrozen(topic1, topic2)
		table = "ninelives_events_frozen"
		logEvent("Frozen")
	case events.TopicRequested:
		a, err = events.UnpackRequested(topic1, topic2)
		table = "ninelives_events_requested"
		logEvent("Requested")
	case events.TopicConcluded:
		a, err = events.UnpackConcluded(topic1)
		table = "ninelives_events_concluded"
		logEvent("Concluded")
	case events.TopicLiquidityAdded:
		a, err = events.UnpackLiquidityAdded(topic1, topic2, topic3, data)
		table = "ninelives_events_liquidity_added"
		logEvent("LiquidityAdded")
		fromTrading = true
	case events.TopicLiquidityAddedSharesSent:
		a, err = events.UnpackLiquidityAddedSharesSent(topic1, topic2, topic3)
		table = "ninelives_events_liquidity_added_shares_sent"
		logEvent("LiquidityAddedSharesSent")
		fromTrading = true
	case events.TopicLiquidityRemoved:
		a, err = events.UnpackLiquidityRemoved(topic1, topic2, topic3)
		table = "ninelives_events_liquidity_removed"
		logEvent("LiquidityRemoved")
		fromTrading = true
	case events.TopicLiquidityRemovedSharesSent:
		a, err = events.UnpackLiquidityRemovedSharesSent(topic1, topic2, topic3)
		table = "ninelives_events_liquidity_removed_shares_sent"
		logEvent("LiquidityRemovedSharesSent")
		fromTrading = true
	case events.TopicLiquidityClaimed:
		a, err = events.UnpackLiquidityClaimed(topic1, topic2)
		table = "ninelives_events_liquidity_claimed"
		logEvent("LiquidityClaimed")
		fromTrading = true
	case events.TopicLPFeesClaimed:
		a, err = events.UnpackLPFeesClaimed(topic1, topic2, topic3, data)
		table = "ninelives_events_lp_fees_claimed"
		logEvent("LPFeesClaimed")
		fromTrading = true
	case events.TopicAddressFeesClaimed:
		a, err = events.UnpackAddressFeesClaimed(topic1, topic2)
		table = "ninelives_events_address_fees_claimed"
		logEvent("AddressFeesClaimed")
		fromTrading = true
	case events.TopicReferrerEarnedFees:
		a, err = events.UnpackReferrerEarnedFees(topic1, topic2, topic3)
		table = "ninelives_referrer_earned_fees"
		logEvent("ReferrerEarnedFees")
		fromTrading = true
	default:
		return false, fmt.Errorf("unexpected topic: %v", topic0)
	}
	if err != nil {
		return false, fmt.Errorf("failed to process topic for table %#v: %v", table, err)
	}
	emitterAddrS := strings.ToLower(emitterAddr.String())
	setEventFields(
		&a,
		blockHash,
		transactionHash,
		blockNumber,
		emitterAddrS,
	)
	isTradingAddr, err := cbIsTrading(emitterAddrS)
	if err != nil {
		return false, fmt.Errorf("finding trading addr: %v", err)
	}
	var (
		isFactory       = factoryAddr == emitterAddr
		isInfraMarket   = infraMarketAddr == emitterAddr
		isLockup        = lockupAddr == emitterAddr
		isSarpSignaller = sarpSignallerAiAddr == emitterAddr
	)
	switch {
	case fromTrading && isTradingAddr:
		// We allow any trading contract.
	case isFactory || isInfraMarket || isLockup || isSarpSignaller:
		// OK!
	default:
		// The submitter was not the factory or the trading contract, we're going to
		// disregard this event.
		slog.Info("We disregarded an event that wasn't created by a trading contract",
			"emitter", emitterAddr,
			"event", a,
		)
		return false, nil
	}
	return true, cbInsert(table, a)
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
		strings.ToLower(addr),
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
	err := db.Table("ninelives_ingestor_checkpointing_1").
		Where("id = ?", 1).
		Find(&c).
		Error
	if err != nil {
		return 0, err
	}
	if c.BlockNumber == 0 {
		return 0, fmt.Errorf("ninelives_ingestor_checkpointing_1 id not set")
	}
	return c.BlockNumber, nil
}

func updateCheckpoint(db *gorm.DB, blockNo uint64) error {
	// We observed a wicked Gorm bug here, so we do this explicitly ourselves.
	err := db.Table("ninelives_ingestor_checkpointing_1").
		Where("id = 1").
		Update("last_updated", time.Now()).
		Update("block_number", blockNo).
		Error
	return err
}
