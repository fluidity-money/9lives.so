package main

import (
	"math/big"
	"os"
	"testing"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/stretchr/testify/assert"
)

func db(t *testing.T, stmts ...string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(os.Getenv("SPN_TIMESCALE_URL")))
	if err != nil {
		t.Fatalf("db: %v", err)
	}
	for _, stmt := range stmts {
		if err := db.Exec(stmt).Error; err != nil {
			t.Fatalf("exec:[ %v", err)
		}
	}
	return db
}

func hd(s string) events.Bytes {
	h, _ := events.BytesFromHex(s)
	return *h
}

func addr(s string) events.Address {
	return events.AddressFromString(s)
}

func no(s string) events.Number {
	i, _ := new(big.Int).SetString(s, 10)
	return events.NumberFromBig(i)
}

func cleardb(t *testing.T, db *gorm.DB) {
	assert.NoError(t,
		db.Exec("DELETE FROM test_1751030119_reading").Error,
	)
}

func TestScanning(t *testing.T) {
	var input []struct {
		Bytes, Bytes8, Bytes32 events.Bytes
		Address                events.Address
		Number                 events.Number
	}
	d := db(t,
		`DROP TABLE test_1751030119_reading`,
		`CREATE TABLE test_1751030119_reading(
			bytes BYTES,
			bytes8 BYTES8,
			bytes32 BYTES32,
			address ADDRESS,
			number HUGEINT,
			permit_r BYTES32
		)`,
		`DELETE FROM test_1751030119_reading`,
		`INSERT INTO test_1751030119_reading VALUES (
			'4e852b32c934543c',
			'4e852b32c934543c',
			'f5174586496cd18e4e9c03336b91fea44a7d4c59d2f483494d876fc14d3967be',
			'0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1',
			192381281818181818181818181282828,
			NULL
		)`,
	).
		Table("test_1751030119_reading")
	assert.NoError(t, d.Scan(&input).Error)
	assert.Equal(t, hd("4e852b32c934543c"), input[0].Bytes)
	assert.Equal(t, hd("4e852b32c934543c"), input[0].Bytes8)
	assert.Equal(t,
		hd("f5174586496cd18e4e9c03336b91fea44a7d4c59d2f483494d876fc14d3967be"),
		input[0].Bytes32,
	)
	assert.Equal(t,
		addr("0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1"),
		input[0].Address,
	)
	assert.Equal(t,
		no("192381281818181818181818181282828"),
		input[0].Number,
	)
	var input2 []struct {
		Bytes, Bytes8, Bytes32 *events.Bytes
		Address                *events.Address
		Number                 *events.Number
		PermitR                *events.Bytes
	}
	cleardb(t, d)
	assert.NoError(t, d.Exec(
		`
		INSERT INTO test_1751030119_reading VALUES (
			NULL,
			'4e852b32c934543c',
			NULL,
			'0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1',
			192381281818181818181818181282828,
			'4d5f31819a16370ca57b86cd8f208d681c3fcc80b8f0fafcb3b63ff2508420d6'
		)`,
	).
		Error,
	)
	assert.NoError(t, d.Scan(&input2).Error)
	assert.Nil(t, input2[0].Bytes)
	assert.Equal(t, hd("4e852b32c934543c"), *input2[0].Bytes8)
	assert.Nil(t, input2[0].Bytes32)
	assert.Equal(t,
		addr("0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1"),
		*input2[0].Address,
	)
	assert.Equal(t,
		no("192381281818181818181818181282828"),
		*input2[0].Number,
	)
	assert.Equal(t,
		hd("4d5f31819a16370ca57b86cd8f208d681c3fcc80b8f0fafcb3b63ff2508420d6"),
		*input2[0].PermitR,
	)
}
