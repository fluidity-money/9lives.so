package main

import (
	"testing"
	"math/big"
	"os"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	"github.com/stretchr/testify/assert"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
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
