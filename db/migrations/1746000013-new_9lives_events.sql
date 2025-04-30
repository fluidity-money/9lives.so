-- migrate:up

CREATE TABLE ninelives_events_liquidity_added (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	fusdc_amt HUGEINT NOT NULL,
	liquidity_shares HUGEINT NOT NULL,
	recipient ADDRESS NOT NULL
);

CREATE TABLE ninelives_events_liquidity_added_shares_sent (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	outcome BYTES8 NOT NULL,
	liquidity_shares HUGEINT NOT NULL,
	recipient ADDRESS NOT NULL
);

CREATE TABLE ninelives_events_liquidity_removed (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	fusdc_amt HUGEINT NOT NULL,
	recipient ADDRESS NOT NULL,
	liquidity_amt HUGEINT NOT NULL
);

CREATE TABLE ninelives_events_liquidity_removed_shares_sent (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	outcome BYTES8 NOT NULL,
	recipient ADDRESS NOT NULL,
	amount HUGEINT NOT NULL
);

CREATE TABLE ninelives_events_liquidity_claimed (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	recipient ADDRESS NOT NULL,
	fusdc_amt HUGEINT NOT NULL
);

-- migrate:down
