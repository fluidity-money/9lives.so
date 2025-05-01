-- migrate:up

CREATE TABLE ninelives_events_lp_fees_claimed (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	sender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	fees_earned HUGEINT NOT NULL,
	sender_liquidity_shares HUGEINT NOT NULL
);

-- migrate:down
