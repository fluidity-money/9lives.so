package main

import (
	"math/big"
	"database/sql"
	"math/rand"
	"testing"

	"github.com/fluidity-money/9lives.so/lib/crypto"
	"github.com/fluidity-money/9lives.so/lib/types/events"
	"github.com/fluidity-money/9lives.so/lib/types/paymaster"

	ethCommon "github.com/ethereum/go-ethereum/common"
)

func b(seed int64, s int) []byte {
	x := make([]byte, s)
	_, _ = rand.New(rand.NewSource(seed)).Read(x)
	return x
}

func b32(x []byte) (b [32]byte) {
	copy(b[:], x)
	return b
}

func b20(x []byte) (b [20]byte) {
	copy(b[:], x)
	return b
}

func b8(x []byte) (b [8]byte) {
	copy(b[:], x)
	return b
}

func addr(s int64) events.Address {
	return events.AddressFromString(
		ethCommon.BytesToAddress(b(s, 20)).String(),
	)
}

func number(s int64) events.Number {
	if s == 0 {
		return events.NumberFromBig(nil)
	}
	return events.NumberFromBig(new(big.Int).SetBytes(b(s, 32)))
}

func bytess(s int64, i int) events.Bytes {
	return events.BytesFromSlice(b(s, i))
}

func FuzzPackOperations(f *testing.F) {
	f.Fuzz(func(t *testing.T,
		owner, referrer, market int64,
		deadline int,
		originatingChainId, nonce, maxFee, amountToSpend, minBack int64,
		permitR, permitS, r, s int64,
		paymasterType, v, permitV uint8,
		outcome int,
	) {
		permitS_ := bytess(permitS, 32)
		permitR_ := bytess(permitR, 32)
		referrer_ := addr(referrer)
		_ = packOperations(crypto.PollToPaymasterOperation(paymaster.Poll{
			Owner:              addr(owner),
			OriginatingChainId: number(originatingChainId),
			Nonce:              number(nonce),
			Deadline:           deadline,
			Typ:                paymasterType,
			PermitR:            sql.NullString{permitR_.String(), true},
			PermitS:            sql.NullString{permitS_.String(), true},
			PermitV:            permitV,
			Market:             addr(market),
			MaximumFee:         number(maxFee),
			AmountToSpend:      number(amountToSpend),
			MinimumBack:        number(minBack),
			Referrer:           &referrer_,
			V:                  v,
			R:                  bytess(r, 32),
			S:                  bytess(s, 32),
			//Outcome:            bytess(outcome, 8),
		}))
	})
}
