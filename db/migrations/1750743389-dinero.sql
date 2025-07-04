-- migrate:up

CREATE TABLE dinero_events_ownership_transferred (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	previous_owner ADDRESS NOT NULL,
	new_owner ADDRESS NOT NULL
);

-- migrate:down
