-- migrate:up

CREATE TABLE ninelives_events_requested(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	trading ADDRESS NOT NULL,
	ticket HUGEINT NOT NULL UNIQUE
);

CREATE TABLE ninelives_events_concluded(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	ticket HUGEINT NOT NULL UNIQUE
);

-- migrate:down
