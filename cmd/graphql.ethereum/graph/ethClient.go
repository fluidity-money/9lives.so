package graph

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

func isContractCreated(c *ethclient.Client, factoryAdd ethCommon.Address, tradingAddr ethCommon.Address) (*bool, error) {
	abiJSON := `[{"type":"function","name":"wasCreated","inputs":[{"name":"addr","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"}]`
	parsedABI, err := abi.JSON(strings.NewReader(abiJSON))
	if err != nil {
		slog.Error("factory abi could not be parsed",
			"factory address", factoryAdd,
			"to be verified trading address", tradingAddr,
			"error", err,
		)
		return nil, fmt.Errorf("factory abi could not be parsed")
	}
	callData, err := parsedABI.Pack("wasCreated", tradingAddr)
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
	err = parsedABI.UnpackIntoInterface(&wasCreated, "wasCreated", result)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack contract call result")
	}
	return &wasCreated, nil
}

func getShareAddr(c *ethclient.Client, tradingAddr ethCommon.Address, outcomeId string) (*ethCommon.Address, error) {
	abiJSON := `[{"inputs":[{"internalType":"bytes8","name":"outcome","type":"bytes8"}],"name":"shareAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]`
	parsedABI, err := abi.JSON(strings.NewReader(abiJSON))
	if err != nil {
		slog.Error("factory abi could not be parsed",
			"outcome id", outcomeId,
			"to be verified trading address", tradingAddr,
			"error", err,
		)
		return nil, fmt.Errorf("factory abi could not be parsed")
	}
	callData, err := parsedABI.Pack("shareAddr", outcomeId)
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
	err = parsedABI.UnpackIntoInterface(&shareAddr, "shareAddr", result)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack contract call result")
	}
	return &shareAddr, nil
}
