-- migrate:up

CREATE TABLE ninelives_events_new_trading2(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	identifier BYTES32 NOT NULL UNIQUE,
	address ADDRESS NOT NULL UNIQUE,
	oracle ADDRESS NOT NULL,
	backend INTEGER NOT NULL
);

-- migrate:down
