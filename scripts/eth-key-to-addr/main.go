package main

import (
	"bytes"
	"crypto/ecdsa"
	"fmt"
	"os"
	"strings"

	ethCrypto "github.com/ethereum/go-ethereum/crypto"
)

func main() {
	var buf bytes.Buffer
	if _, err := buf.ReadFrom(os.Stdin); err != nil {
		panic(err)
	}
	string := strings.TrimSpace(buf.String())
	privateKey, err := ethCrypto.HexToECDSA(string)
	if err != nil {
		panic(err)
	}
	publicKey := privateKey.Public().(*ecdsa.PublicKey)
	fmt.Println(ethCrypto.PubkeyToAddress(*publicKey))
}
