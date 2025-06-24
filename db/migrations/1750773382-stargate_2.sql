-- migrate:up

CREATE TABLE stargate_events_oft_sent (
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
	amount_received_ld HUGEINT NOT NULL
);

-- migrate:down
