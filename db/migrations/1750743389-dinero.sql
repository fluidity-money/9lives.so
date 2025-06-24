-- migrate:up

CREATE TABLE dinero_events_oft_received (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	guid BYTES32 NOT NULL,
	src_eid INTEGER NOT NULL,
	to_address ADDRESS NOT NULL,
	amount_received_ld HUGEINT NOT NULL
);

CREATE TABLE dinero_events_oft_sent (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	guid BYTES32 NOT NULL,
	dst_eid INTEGER NOT NULL,
	from_address ADDRESS NOT NULL,
	amount_sent_ld HUGEINT NOT NULL,
	amount_received_ld HUGEINT NOT NULL,
);

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
