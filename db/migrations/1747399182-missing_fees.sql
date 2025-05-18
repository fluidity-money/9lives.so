-- migrate:up

CREATE TABLE ninelives_events_address_fees_claimed(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	recipient ADDRESS NOT NULL,
	amount HUGEINT NOT NULL
);

CREATE TABLE ninelives_referrer_earned_fees(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	recipient ADDRESS NOT NULL,
	fees HUGEINT NOT NULL,
	volume HUGEINT NOT NULL
);

-- migrate:down
