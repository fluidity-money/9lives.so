-- migrate:up

CREATE TABLE sudoswap_new_erc721pair(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	pool_address ADDRESS NOT NULL,
	initial_ids JSONB NOT NULL
);

-- migrate:down
