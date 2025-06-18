-- migrate:up

CREATE TABLE onchaingm_events_onchaingmevent(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	sender ADDRESS NOT NULL,
	referrer ADDRESS NOT NULL
);

-- migrate:down
