-- migrate:up

CREATE TABLE ninelives_events_amm_details (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	product HUGEINT NOT NULL,
	shares JSONB NOT NULL
);

-- migrate:down
