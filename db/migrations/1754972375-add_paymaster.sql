-- migrate:up

CREATE TABLE ninelives_events_paymaster_paid_for(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	owner ADDRESS NOT NULL,
	maximum_fee HUGEINT NOT NULL,
	amount_to_spend HUGEINT NOT NULL,
	fee_taken HUGEINT NOT NULL,
	referrer ADDRESS NOT NULL,
	outcome BYTES8 NOT NULL
);

CREATE TABLE events_ninelives_stargate_bridged(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	guid BYTES32 NOT NULL UNIQUE,
	spender ADDRESS NOT NULL,
	amount_received HUGEINT NOT NULL,
	amount_fee HUGEINT NOT NULL,
	destination_eid INTEGER NOT NULL
);

-- migrate:down
