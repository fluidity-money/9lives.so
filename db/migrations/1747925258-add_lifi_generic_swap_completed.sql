-- migrate:up

CREATE TABLE lifi_events_generic_swap_completed(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	transaction_id BYTES32 NOT NULL,
	integrator VARCHAR(100) NOT NULL,
	referrer VARCHAR(100) NOT NULL,
	receiver ADDRESS NOT NULL,
	from_asset_id ADDRESS NOT NULL,
	to_asset_id ADDRESS NOT NULL,
	from_amount HUGEINT NOT NULL,
	to_amount HUGEINT NOT NULL
);

-- migrate:down
