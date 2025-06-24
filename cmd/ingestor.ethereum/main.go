package main

import (
	"log/slog"
	"math/rand"

	"github.com/fluidity-money/9lives.so/lib/setup"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/features"

	_ "github.com/lib/pq"

	gormSlog "github.com/orandin/slog-gorm"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	ethCommon "github.com/ethereum/go-ethereum/common"

	"github.com/ethereum/go-ethereum/ethclient"
)

const (
	// DefaultPaginationBlockCountMin to use as the minimum number of blocks
	// to increase by.
	DefaultPaginationBlockCountMin = 1000

	// DefaultPaginationBlockCountMax to increase the last known block tracked
	// by with.
	DefaultPaginationBlockCountMax = 10_000

	// DefaultPaginationPollWait to wait between polls.
	DefaultPaginationPollWait = 5 // Seconds
)

func main() {
	defer setup.Flush()
	config := config.Get()
	db, err := gorm.Open(postgres.Open(config.PickTimescaleUrl()), &gorm.Config{
		Logger: gormSlog.New(),
	})
	if err != nil {
		setup.Exitf("opening postgres: %v", err)
	}
	// Start to ingest block headers by connecting to the websocket given.
	c, err := ethclient.Dial(config.PickGethUrl())
	if err != nil {
		setup.Exitf("websocket dial: %v", err)
	}
	defer c.Close()
	ingestorPagination := rand.Intn(DefaultPaginationBlockCountMax-DefaultPaginationBlockCountMin) + DefaultPaginationBlockCountMin
	slog.Info("polling configuration",
		"poll wait time amount", DefaultPaginationPollWait,
		"pagination block count min", DefaultPaginationBlockCountMin,
		"pagination block count max", DefaultPaginationBlockCountMax,
		"pagination count", ingestorPagination,
	)
	Entry(
		features.Get(),
		ingestorPagination,
		DefaultPaginationPollWait,
		c,
		db,
		IngestorArgs{
			Factory:         ethCommon.HexToAddress(config.FactoryAddress),
			InfraMarket:     ethCommon.HexToAddress(config.InfraMarketAddress),
			Lockup:          ethCommon.HexToAddress(config.LockupAddress),
			SarpSignallerAi: ethCommon.HexToAddress(config.SarpAiSignallerAddress),
			LifiDiamond:     ethCommon.HexToAddress(config.LifiDiamondAddress),
			Layerzero:       ethCommon.HexToAddress(config.LayerzeroEndpointAddress),
			Dinero:          ethCommon.HexToAddress(config.DineroAddress),
		},
	)
}
