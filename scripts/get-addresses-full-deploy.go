package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	ethCommon "github.com/ethereum/go-ethereum/common"
	ethCrypto "github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const EnvGethUrl = "SPN_SUPERPOSITION_URL"

func main() {
	if !ethCommon.IsHexAddress(os.Args[1]) {
		panic(fmt.Sprintf("not hex address: %v", os.Args[1]))
	}
	addr := ethCommon.HexToAddress(os.Args[1])
	url := os.Getenv(EnvGethUrl)
	if url == "" {
		panic("SPN_SUPERPOSITION_URL not set")
	}
	c, err := ethclient.Dial(url)
	if err != nil {
		panic(fmt.Errorf("failed to dial: %v", err))
	}
	defer c.Close()
	nonce, err := c.NonceAt(context.Background(), addr, nil)
	if err != nil {
		panic(fmt.Errorf("failed to get nonce for %v: %v", addr, err))
	}
	var (
		factory1Impl      = ethCrypto.CreateAddress(addr, nonce)
		factory2Impl      = ethCrypto.CreateAddress(addr, nonce+2)
		tradingMintImpl   = ethCrypto.CreateAddress(addr, nonce+4)
		tradingExtrasImpl = ethCrypto.CreateAddress(addr, nonce+6)
		erc20Impl         = ethCrypto.CreateAddress(addr, nonce+8)
		factoryProxy      = ethCrypto.CreateAddress(addr, nonce+9)
	)
	_ = json.NewEncoder(os.Stdout).Encode(map[string]any{
		"factory1Impl":      factory1Impl,
		"factory2Impl":      factory2Impl,
		"tradingMintImpl":   tradingMintImpl,
		"tradingExtrasImpl": tradingExtrasImpl,
		"erc20Impl":         erc20Impl,
		"factoryProxy":      factoryProxy,
	})
	fmt.Fprintf(
		os.Stderr,
		`export SPN_FACTORY_1_IMPL_ADDR='%v' SPN_FACTORY_2_IMPL_ADDR='%v' SPN_TRADING_MINT_IMPL_ADDR='%v' SPN_TRADING_EXTRAS_IMPL_ADDR='%v' SPN_ERC20_IMPL_ADDR='%v' SPN_FACTORY_PROXY_ADDR='%v'`,
		factory1Impl,
		factory2Impl,
		tradingMintImpl,
		tradingExtrasImpl,
		erc20Impl,
		factoryProxy,
	)
}
