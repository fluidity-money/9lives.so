package main

import (
	"github.com/fluidity-money/9lives.so/lib/crypto"
	"github.com/fluidity-money/9lives.so/lib/setup"
)

func packOperations(ops ...crypto.PaymasterOperation) []byte {
	cd, err := abi.Pack("multicall", ops)
	if err != nil {
		setup.Exitf("packing error: %v", err)
	}
	return cd
}
