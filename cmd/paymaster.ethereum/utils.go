package main

import (
	"github.com/fluidity-money/9lives.so/lib/crypto"
	paymasterMisc "github.com/fluidity-money/9lives.so/lib/misc/paymaster"
	"github.com/fluidity-money/9lives.so/lib/setup"
)

func packOperations(ops ...crypto.PaymasterOperation) []byte {
	cd, err := paymasterMisc.Abi.Pack("multicall", ops)
	if err != nil {
		setup.Exitf("packing error: %v", err)
	}
	return cd
}
