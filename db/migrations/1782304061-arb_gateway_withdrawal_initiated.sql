-- migrate:up

CREATE TABLE arb_gateway_events_withdrawal_initiated(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	l1_token ADDRESS NOT NULL,
	from_ ADDRESS NOT NULL,
	to_ ADDRESS NOT NULL,
	l2_to_l1_id HUGEINT NOT NULL,
	exit_num HUGEINT NOT NULL,
	amount HUGEINT NOT NULL
);

-- migrate:down
