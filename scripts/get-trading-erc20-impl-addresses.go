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
		trading = ethCrypto.CreateAddress(addr, nonce+1)
		erc20 = ethCrypto.CreateAddress(addr, nonce+2)
	)
	fmt.Printf(`export \
	SPN_TRADING_IMPL=%v \
	SPN_FACTORY_IMPL=%v
`,
		trading,
		erc20,
	)
}
