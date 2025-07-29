package main

import (
	"testing"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	"github.com/stretchr/testify/assert"
)

func TestInsertAmmDetails(t *testing.T) {
	d := db(t,
		`DROP TABLE IF EXISTS test_1753772017`,
		`CREATE TABLE test_1753772017(
			id SERIAL PRIMARY KEY,
			created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			block_hash HASH NOT NULL,
			transaction_hash HASH NOT NULL,
			block_number INTEGER NOT NULL,
			emitter_addr ADDRESS NOT NULL,

			product HUGEINT NOT NULL,
			shares JSONB NOT NULL
)`,
	)
	err := d.
		Table("test_1753772017").
		Set("gorm:table_options", "").
		Create(events.EventAmmDetails{
			Product: no("123191"),
			Shares:  []events.ShareDetail{
				{
					Shares: no("1288211"),
					Identifier: hd("0x893b7b3126802bf0"),
				},
				{
					Shares: no("999999"),
					Identifier: hd("0x6edd2440b9818c34"),
				},
			},
		}).
		Error
	assert.NoError(t, err)
	var details []events.EventAmmDetails
	assert.NoError(t, d.Table("test_1753772017").Find(&details).Error)
	assert.Equal(t, no("1288211"),details[0].Shares[0].Shares)
}
