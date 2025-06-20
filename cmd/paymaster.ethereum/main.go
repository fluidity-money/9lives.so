package main

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/heartbeat"
	"github.com/fluidity-money/9lives.so/lib/setup"
	"github.com/fluidity-money/9lives.so/lib/crypto"
	"github.com/fluidity-money/9lives.so/lib/types/paymaster"

	_ "github.com/lib/pq"

	gormSlog "github.com/orandin/slog-gorm"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/ethereum/go-ethereum"
	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethAbiBind "github.com/ethereum/go-ethereum/accounts/abi/bind/v2"
	ethCommon "github.com/ethereum/go-ethereum/common"
	ethCrypto "github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const (
	EnvPrivateKey       = "SPN_SUPERPOSITION_KEY"
	EnvPaymasterAddr    = "SPN_PAYMASTER_ADDR"
	EnvPollLifeTimeSecs = "SPN_POLL_LIFE_TIME_SECS"
	EnvSleepTimeSecs    = "SPN_SLEEP_SECS"
)

//go:embed abi.json
var abiB []byte

var abi, _ = ethAbi.JSON(bytes.NewReader(abiB))

func main() {
	defer setup.Flush()
	config := config.Get()
	privateKey, err := ethCrypto.HexToECDSA(os.Getenv(EnvPrivateKey))
	if err != nil {
		setup.Exitf("private key: %v", err)
	}
	pollLifetimeSecs, err := strconv.Atoi(os.Getenv(EnvPollLifeTimeSecs))
	if err != nil {
		setup.Exitf("poll life time strconv: %v", err)
	}
	sleepSecs, err := strconv.Atoi(os.Getenv(EnvSleepTimeSecs))
	if err != nil {
		setup.Exitf("sleep secs: %v", err)
	}
	if !ethCommon.IsHexAddress(os.Getenv(EnvPaymasterAddr)) {
		setup.Exitf("SPN_PAYMASTER_ADDR not set")
	}
	paymasterAddr := ethCommon.HexToAddress(os.Getenv(EnvPaymasterAddr))
	c, err := ethclient.Dial(config.PickGethUrl())
	if err != nil {
		setup.Exitf("geth dial: %v", err)
	}
	defer c.Close()
	chainId, err := c.ChainID(context.Background())
	if err != nil {
		setup.Exitf("chain id: %v", err)
	}
	db, err := gorm.Open(postgres.Open(config.PickTimescaleUrl()), &gorm.Config{
		Logger: gormSlog.New(),
	})
	if err != nil {
		setup.Exitf("opening postgres: %v", err)
	}
	f := features.Get()
	transactOpts := ethAbiBind.NewKeyedTransactor(privateKey, chainId)
L:
	for {
		heartbeat.Pulse()
		ctx, cancelCtx := context.WithTimeout(
			context.Background(),
			time.Second*time.Duration(pollLifetimeSecs),
		)
		transactOpts.Context = ctx
		err = f.On(features.FeatureShouldPriceCalldata, func() error {
			return fmt.Errorf("TODO")
		})
		if err != nil {
			setup.Exitf("estimating price calldata: %v", err)
		}
		var items []paymaster.Poll
		err = db.WithContext(ctx).
			Table("ninelives_paymaster_poll_outstanding_1").
			Scan(&items).
			Error
		if err != nil {
			setup.Exitf("scan outstanding polls: %v", err)
		}
		if len(items) == 0 {
			cancelCtx()
			sleep(sleepSecs)
			continue
		}
		operations := make([]crypto.PaymasterOperation, 0, len(items))
		for _, x := range items {
			operations = append(operations, crypto.PollToPaymasterOperation(x))
		}
		// Now that we've packed the data, let's simulate the cumulative data
		// here, and see if any transactions won't execute. If they won't, then
		// we remove them from the array that we have, and prune the results,
		// then send. And we hit the database function that indicates we had a
		// failure to submit this.
		cd, err := abi.Pack("multicall", operations)
		if err != nil {
			setup.Exitf("packing error: %v", err)
		}
		callRes, err := c.CallContract(ctx, ethereum.CallMsg{
			To:   &paymasterAddr,
			Data: cd,
		}, nil)
		if err != nil {
			setup.Exitf("call result: %v", err)
		}
		// These are the bad ids we need to call with our function to remove.
		callResI, err := abi.Unpack("multicall", callRes)
		if err != nil {
			setup.Exitf("unpack simulate: %v", err)
		}
		callResResults, ok := callResI[0].([]bool)
		if !ok {
			setup.Exitf("call results: %T", callResI[0])
		}
		// Start to swap and then track the bad instances here.
		var badIds []int
		for i, r := range callResResults {
			if r {
				continue
			}
			// Looks like we had a bad result here. We need to replace it with the
			// end then track. Later, we'll use the length of the bad ids to pop.
			badIds = append(badIds, items[i].ID)
			x := operations[len(operations)-len(badIds)]
			operations[i] = x
		}
		goodIds := make([]int, 0, len(items)-len(badIds))
		for _, item := range items {
			goodIds = append(goodIds, item.ID)
		}
		logIds(db, badIds, goodIds)
		// We need to regenerate the calldata now with the trimmed ids.
		cd, err = abi.Pack("multicall", operations[:len(badIds)])
		if err != nil {
			setup.Exitf("new operation count packing error: %v", err)
		}
		// Start to swap around the values that aren't going to work properly.
		gas, err := c.EstimateGas(ctx, ethereum.CallMsg{
			To:   &paymasterAddr,
			Data: cd,
		})
		if err != nil {
			setup.Exitf("estimate gas: %v", err)
		}
		// Now that we know the gas, it's time to submit!
		bc := ethAbiBind.NewBoundContract(paymasterAddr, abi, c, c, c)
		// Get a safe upper bound for the gas amount.
		gas = uint64(float64(gas) * 1.25)
		tx, err := bc.Transact(transactOpts, "multicall", operations[:len(badIds)])
		if err != nil {
			setup.Exitf("transact failure: %v", err)
		}
		for {
			select {
			case <-ctx.Done():
				setup.Exitf("ran outside context window: %v", err)
			default:
				slog.Info("Submitted transaction", "tx", tx)
				sleep(sleepSecs)
				continue L
			}
		}
	}
}

func logIds(db *gorm.DB, badIds, goodIds []int) {
	// Generate the template that uses the function to take a id as having a failure.
}

func sleep(secs int) {
	time.Sleep(time.Duration(secs) * time.Second)
}
