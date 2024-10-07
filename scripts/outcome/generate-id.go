package main

import (
	"encoding/csv"
	"fmt"
	"os"

	ethCrypto "github.com/ethereum/go-ethereum/crypto"
)

func main() {
	identifier := ethCrypto.Keccak256([]byte(os.Args[1] + os.Args[2] + os.Args[3]))[:8]
	writer := csv.NewWriter(os.Stdout)
	defer writer.Flush()
	data := []string{
		os.Args[1],                      // Name
		os.Args[2],                      // Description
		os.Args[3],                      // Seed
		fmt.Sprintf("0x%x", identifier), // Identifier in hex format
	}
	if err := writer.Write(data); err != nil {
		panic(err)
	}
}
