package main

import (
	"encoding/csv"
	"fmt"
	"os"
	"strconv"

	"github.com/fluidity-money/9lives.so/lib/crypto"
)

func main() {
	seed, err := strconv.ParseInt(os.Args[3], 10, 0)
	if err != nil {
		panic(err)
	}
	identifier, err := crypto.GetOutcomeId(os.Args[1], os.Args[2], int(seed))
	if err != nil {
		panic(err)
	}
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
