package graph

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"log/slog"

	"github.com/ethereum/go-ethereum"
	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

//go:embed abis/factoryAbi.json
var factoryAbiBytes []byte

//go:embed abis/tradingAbi.json
var tradingAbiBytes []byte

var factoryAbi, _ = ethAbi.JSON(bytes.NewReader(factoryAbiBytes))
var tradingAbi, _ = ethAbi.JSON(bytes.NewReader(tradingAbiBytes))

func isContractCreated(c *ethclient.Client, factoryAdd ethCommon.Address, tradingAddr ethCommon.Address) (*bool, error) {
	callData, err := factoryAbi.Pack("wasCreated", tradingAddr)
	if err != nil {
		slog.Error("callData could not be prepared",
			"factory address", factoryAdd,
			"to be verified trading address", tradingAddr,
			"error", err,
		)
		return nil, fmt.Errorf("callData could not be prepared")
	}
	result, err := c.CallContract(context.Background(), ethereum.CallMsg{
		To:   &factoryAdd,
		Data: callData,
	}, nil)
	if err != nil {
		slog.Error("can not call wasCreated from contract",
			"factory address", factoryAdd,
			"call data", callData,
			"error", err,
		)
		return nil, fmt.Errorf("can not call wasCreated from contract")
	}
	var wasCreated bool
	err = factoryAbi.UnpackIntoInterface(&wasCreated, "wasCreated", result)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack contract call result")
	}
	return &wasCreated, nil
}

func getShareAddr(c *ethclient.Client, tradingAddr ethCommon.Address, outcomeId [8]byte) (*ethCommon.Address, error) {
	callData, err := tradingAbi.Pack("shareAddr", outcomeId)
	if err != nil {
		slog.Error("callData could not be prepared",
			"outcome id", outcomeId,
			"to be verified trading address", tradingAddr,
			"error", err,
		)
		return nil, fmt.Errorf("callData could not be prepared")
	}
	result, err := c.CallContract(context.Background(), ethereum.CallMsg{
		To:   &tradingAddr,
		Data: callData,
	}, nil)
	if err != nil {
		slog.Error("can not call wasCreated from contract",
			"trading address", tradingAddr,
			"call data", callData,
			"error", err,
		)
		return nil, fmt.Errorf("can not call shareAddr from contract")
	}
	var shareAddr ethCommon.Address
	err = tradingAbi.UnpackIntoInterface(&shareAddr, "shareAddr", result)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack contract call result")
	}
	return &shareAddr, nil
}
