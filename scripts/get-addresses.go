package main

import (
	"context"
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
		factory = ethCrypto.CreateAddress(addr, nonce+1)
		trading = ethCrypto.CreateAddress(addr, nonce+2)
		erc20   = ethCrypto.CreateAddress(addr, nonce+3)
	)
	fmt.Printf(`export \
	SPN_FACTORY_ADDR=%v \
	SPN_ERC20_IMPL_ADDR=%v \
	SPN_TRADING_IMPL_ADDR=%v
`,
		factory,
		erc20,
		trading,
	)
}
