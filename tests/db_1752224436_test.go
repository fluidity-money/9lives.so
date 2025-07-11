package main

import (
	"math/big"
	"testing"

	"github.com/fluidity-money/9lives.so/lib/events/sudoswap"
	"github.com/fluidity-money/9lives.so/lib/types/events"

	"github.com/stretchr/testify/assert"
)

func TestInsertSudoswapIds(t *testing.T) {
	d := db(t,
		`DROP TABLE IF EXISTS test_1752224436`,
		`CREATE TABLE test_1752224436(
			id SERIAL PRIMARY KEY,
			created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			block_hash HASH NOT NULL,
			transaction_hash HASH NOT NULL,
			block_number INTEGER NOT NULL,
			emitter_addr ADDRESS NOT NULL,

			pool_address ADDRESS NOT NULL,
			initial_ids JSONB NOT NULL
		)`,
	)
	ids := make([]events.Number, 4)
	for i := range 4 {
		ids[i] = events.NumberFromBig(new(big.Int).SetInt64(int64(i)))
	}
	err := d.
		Table("test_1752224436").
		Set("gorm:table_options", "").
		Create(sudoswap.EventNewERC721Pair{
			PoolAddress: addr("0x6221a9c005f6e47eb398fd867784cacfdcfff4e7"),
			InitialIds:  ids,
		}).
		Error
	assert.NoError(t, err)
	var result []sudoswap.EventNewERC721Pair
	assert.NoError(t, d.Table("test_1752224436").Find(&result).Error)
}
