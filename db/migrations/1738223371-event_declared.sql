-- migrate:up

CREATE TABLE ninelives_events_declared(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	trading_addr ADDRESS NOT NULL UNIQUE,
	winning_outcome BYTES8 NOT NULL,
	fee_recipient ADDRESS NOT NULL
);

-- migrate:down
