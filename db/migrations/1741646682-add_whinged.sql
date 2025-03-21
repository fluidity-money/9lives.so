-- migrate:up

CREATE TABLE ninelives_events_whinged(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	trading_addr ADDRESS NOT NULL,
	preferred_outcome BYTES32 NOT NULL,
	whinger ADDRESS NOT NULL
);

-- migrate:down
