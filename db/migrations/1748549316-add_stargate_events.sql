-- migrate:up

CREATE TABLE stargate_events_stargate_oft_received(
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

-- migrate:down
