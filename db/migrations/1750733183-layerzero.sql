-- migrate:up

DO $$
	BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_type WHERE typname = 'bytes'
	) THEN
		CREATE DOMAIN BYTES AS VARCHAR;
	END IF;
END $$;

CREATE TABLE layerzero_events_packet_burnt (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	src_eid INTEGER NOT NULL,
	sender ADDRESS NOT NULL,
	receiver ADDRESS NOT NULL,
	nonce BIGINT NOT NULL,
	payload_hash BYTES32 NOT NULL
);

CREATE TABLE layerzero_events_packet_delivered (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	origin_src_eid INTEGER NOT NULL,
	origin_sender BYTES32 NOT NULL,
	origin_nonce BIGINT NOT NULL,
	receiver ADDRESS NOT NULL
);

CREATE TABLE layerzero_events_packet_nilified (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	src_eid INTEGER NOT NULL,
	sender BYTES32 NOT NULL,
	receiver ADDRESS NOT NULL,
	nonce BIGINT NOT NULL,
	payload_hash BYTES32 NOT NULL
);

CREATE TABLE layerzero_events_packet_sent (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	encoded_payload BYTES NOT NULL,
	options BYTES NOT NULL,
	send_library ADDRESS NOT NULL
);

CREATE TABLE layerzero_events_packet_verified (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	origin_src_eid INTEGER NOT NULL,
	origin_sender BYTES32 NOT NULL,
	origin_nonce BIGINT NOT NULL,
	receiver ADDRESS NOT NULL,
	payload_hash BYTES32 NOT NULL
);

-- migrate:down
