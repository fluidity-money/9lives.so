-- migrate:up

CREATE TABLE ninelives_events_shares_burned(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	identifier BYTES8 NOT NULL,
	share_amount HUGEINT NOT NULL,
	spender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	fusdc_returned HUGEINT NOT NULL
);

-- migrate:down
