package main

import (
	"bytes"
	"context"
	"crypto/ecdsa"
	"database/sql"
	_ "embed"
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/crypto"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/heartbeat"
	"github.com/fluidity-money/9lives.so/lib/setup"
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
	EnvPollLifeTimeSecs = "SPN_POLL_LIFE_TIME_SECS"
	EnvSleepTimeSecs    = "SPN_SLEEP_SECS"
)

//go:embed abi.json
var abiB []byte

var abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

func main() {
	defer setup.Flush()
	config := config.Get()
	privateKey, err := ethCrypto.HexToECDSA(os.Getenv(EnvPrivateKey))
	if err != nil {
		setup.Exitf("private key: %v", err)
	}
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		setup.Exitf("error casting public key")
	}
	// Generate the Ethereum address from the public key
	fromAddr := ethCrypto.PubkeyToAddress(*publicKeyECDSA)
	pollLifetimeSecs, err := strconv.Atoi(os.Getenv(EnvPollLifeTimeSecs))
	if err != nil {
		setup.Exitf("poll life time strconv: %v", err)
	}
	sleepSecs, err := strconv.Atoi(os.Getenv(EnvSleepTimeSecs))
	if err != nil {
		setup.Exitf("sleep secs: %v", err)
	}
	paymasterAddr := ethCommon.HexToAddress(config.PaymasterAddress)
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
			Table("ninelives_paymaster_poll_outstanding_2").
			Limit(200).
			Scan(&items).
			Error
		if err != nil {
			setup.Exitf("scan outstanding polls: %v", err)
		}
		slog.Debug("About to process outstanding polls",
			"polls", items,
		)
		if len(items) == 0 {
			cancelCtx()
			sleep(sleepSecs)
			heartbeat.Pulse()
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
		callCd := packOperations(operations...)
		callRes, err := c.CallContract(ctx, ethereum.CallMsg{
			To:   &paymasterAddr,
			From: fromAddr,
			Data: callCd,
		}, nil)
		if err != nil {
			setup.Exitf("call result, address: %v, calldata: %x: %v", paymasterAddr, callCd, err)
		}
		if len(callRes) == 0 {
			setup.Exitf("error calling, sender: %v: %x", fromAddr, callCd)
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
		var badIds, goodIds []int
		for i, r := range callResResults {
			if r {
				goodIds = append(goodIds, items[i].ID)
			} else {
				// Looks like we had a bad result here. We need to replace it with the
				// end then track. Later, we'll use the length of the bad ids to pop.
				badIds = append(badIds, items[i].ID)
				x := operations[len(operations)-len(badIds)]
				operations[i] = x
			}
		}
		goodLen := len(operations) - len(badIds)
		slog.Debug("Id separation", "good ids", goodIds, "bad ids", badIds)
		if goodLen == 0 {
			// There weren't any ids we should continue with! Don't do anything.
			logIds(db, ctx, badIds, goodIds, "")
			heartbeat.Pulse()
			continue L
		}
		// We need to regenerate the calldata now with the trimmed ids.
		// Start to swap around the values that aren't going to work properly.
		sendCd := packOperations(operations[:goodLen]...)
		gas, err := c.EstimateGas(ctx, ethereum.CallMsg{
			To:   &paymasterAddr,
			From: fromAddr,
			Data: sendCd,
		})
		if err != nil {
			setup.Exitf("estimate gas: %v", err)
		}
		// Now that we know the gas, it's time to submit!
		bc := ethAbiBind.NewBoundContract(paymasterAddr, abi, c, c, c)
		// Get a safe upper bound for the gas amount.
		gas = uint64(float64(gas) * 1.25)
		tx, err := bc.Transact(transactOpts, "multicall", operations[:goodLen])
		if err != nil {
			setup.Exitf("transact failure: %v", err)
		}
		for {
			select {
			case <-ctx.Done():
				setup.Exitf("ran outside context window: %v", err)
			default:
				slog.Info("Submitted transaction", "tx", tx)
				logIds(db, ctx, badIds, goodIds, tx.Hash().String())
				sleep(sleepSecs)
				heartbeat.Pulse()
				continue L
			}
		}
	}
}

func logIds(db *gorm.DB, ctx context.Context, badIds, goodIds []int, h string) {
	// Generate the template that uses the function to take a id as having a failure.
	logIds := make([]LogId, 0, len(badIds)+len(goodIds))
	tx := sql.NullString{h, false}
	if h != "" {
		tx.Valid = true
	}
	for _, b := range badIds {
		logIds = append(logIds, LogId{b, false, tx})
	}
	for _, g := range goodIds {
		logIds = append(logIds, LogId{g, true, tx})
	}
	if err := db.Exec(GenLogIds(logIds...)).Error; err != nil {
		setup.Exitf("inserting tracked ids: %v", err)
	}
}

func sleep(secs int) {
	time.Sleep(time.Duration(secs) * time.Second)
}

func init() {
	if abiErr != nil {
		panic(abiErr)
	}
}
