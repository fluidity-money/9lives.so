-- migrate:up

CREATE TABLE ninelives_events_debt_repaid(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	repayer ADDRESS NOT NULL,
	surplus HUGEINT NOT NULL,
	deficit HUGEINT NOT NULL
);

CREATE TABLE ninelives_events_seed_liquidity_added (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	fusdc_amt HUGEINT NOT NULL
);

-- migrate:down
