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

var (
	//go:embed abis/factoryAbi.json
	factoryAbiBytes []byte
	//go:embed abis/tradingAbi.json
	tradingAbiBytes []byte
)

var (
	factoryAbi, _  = ethAbi.JSON(bytes.NewReader(factoryAbiBytes))
	tradingAbi, _ = ethAbi.JSON(bytes.NewReader(tradingAbiBytes))
)

func getTradingAddr(c *ethclient.Client, factoryAddr ethCommon.Address, id []byte) (*ethCommon.Address, error) {
	calldata, err := factoryAbi.Pack("getTradingAddr", id)
	if err != nil {
		slog.Error("calldata could not be prepared",
			"factory address", factoryAddr,
			"error", err,
			"id", id,
		)
		return nil, fmt.Errorf("calldata could not be prepared")
	}
	res, err := c.CallContract(context.Background(), ethereum.CallMsg{
		To:   &factoryAddr,
		Data: calldata,
	}, nil)
	if err != nil {
		slog.Error("can not call getTradingAddr from contract",
			"factory address", factoryAddr,
			"call data", calldata,
			"id", id,
			"error", err,
		)
		return nil, fmt.Errorf("can not call getOwner from contract")
	}
	a, err := factoryAbi.Unpack("getTradingAddr", res)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack contract call res")
	}
	owner, ok := a[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("convert trading addr: %T", a[0])
	}
	return &owner, nil
}

func getOwner(c *ethclient.Client, factoryAddr, tradingAddr ethCommon.Address) (*ethCommon.Address, error) {
	calldata, err := factoryAbi.Pack("getOwner", tradingAddr)
	if err != nil {
		slog.Error("calldata could not be prepared",
			"factory address", factoryAddr,
			"to be verified trading address", tradingAddr,
			"error", err,
		)
		return nil, fmt.Errorf("calldata could not be prepared")
	}
	res, err := c.CallContract(context.Background(), ethereum.CallMsg{
		To:   &factoryAddr,
		Data: calldata,
	}, nil)
	if err != nil {
		slog.Error("can not call getOwner from contract",
			"factory address", factoryAddr,
			"call data", calldata,
			"error", err,
		)
		return nil, fmt.Errorf("can not call getOwner from contract")
	}
	var owner ethCommon.Address
	err = factoryAbi.UnpackIntoInterface(&owner, "getOwner", res)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack contract call res")
	}
	return &owner, nil
}

func getShareAddr(c *ethclient.Client, tradingAddr ethCommon.Address, outcomeId [8]byte) (*ethCommon.Address, error) {
	calldata, err := tradingAbi.Pack("shareAddr", outcomeId)
	if err != nil {
		slog.Error("calldata could not be prepared",
			"outcome id", outcomeId,
			"to be verified trading address", tradingAddr,
			"error", err,
		)
		return nil, fmt.Errorf("calldata could not be prepared")
	}
	result, err := c.CallContract(context.Background(), ethereum.CallMsg{
		To:   &tradingAddr,
		Data: calldata,
	}, nil)
	if err != nil {
		slog.Error("can not call wasCreated from contract",
			"trading address", tradingAddr,
			"call data", calldata,
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
