package main

import (
	"fmt"
	"os"
	"strconv"

	"github.com/fluidity-money/9lives.so/lib/crypto"
)

func main() {
	s, err := strconv.ParseInt(os.Args[2], 10, 0)
	if err != nil {
		panic(err)
	}
	id, err := crypto.GetOutcomeId(os.Args[1], uint64(s))
	if err != nil {
		panic(err)
	}
	fmt.Printf("0x%x\n", id)
}
