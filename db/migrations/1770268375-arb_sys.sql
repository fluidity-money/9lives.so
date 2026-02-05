-- migrate:up

CREATE TABLE arb_sys_events_l2_to_l1_tx(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	caller ADDRESS NOT NULL,
	destination ADDRESS NOT NULL,
	hash BYTES32 NOT NULL UNIQUE,
	position INTEGER NOT NULL,
	arb_block_num INTEGER NOT NULL,
	eth_block_num INTEGER NOT NULL,
	timestamp INTEGER NOT NULL,
	callvalue HUGEINT NOT NULL,
	data BYTES NOT NULL
);

CREATE VIEW arb_sys_outside_challenge_period_1 AS
	SELECT *
	FROM arb_sys_events_l2_to_l1_tx
	WHERE created_by < current_timestamp - interval '26 hours';

-- migrate:down
