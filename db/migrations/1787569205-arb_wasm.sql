-- migrate:up

CREATE TABLE arb_wasm_events_program_activated (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	codehash BYTES32 NOT NULL,
	module_hash BYTES32 NOT NULL,
	program ADDRESS NOT NULL,
	data_fee HUGEINT NOT NULL,
	version INTEGER NOT NULL
);

CREATE INDEX ON arb_wasm_events_program_activated (program, id DESC);

-- migrate:down

DROP TABLE arb_wasm_events_program_activated;
