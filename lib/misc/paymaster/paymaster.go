package paymaster

import (
	_ "embed"
	"bytes"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
)

//go:embed abi.json
var abiB []byte

var Abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

func init() {
	if abiErr != nil {
		panic(abiErr)
	}
}
