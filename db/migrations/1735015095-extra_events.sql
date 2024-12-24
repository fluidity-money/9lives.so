-- migrate:up

CREATE TABLE ninelives_events_deadline_extension(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	identifier BYTES32 NOT NULL UNIQUE,
	address ADDRESS NOT NULL UNIQUE,
	oracle ADDRESS NOT NULL
);

CREATE TABLE ninelives_events_market_created2(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	incentive_sender TEXT NOT NULL,
	trading_addr TEXT NOT NULL,
	desc_ BYTES32 NOT NULL,
	launch_ts TIMESTAMP NOT NULL,
	call_deadline TIMESTAMP NOT NULL
);

CREATE TABLE ninelives_events_call_made(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	trading_addr ADDRESS NOT NULL UNIQUE,
	winner BYTES8 NOT NULL,
	incentive_recipient ADDRESS NOT NULL
);

CREATE TABLE ninelives_events_infra_market_closed(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	incentive_recipient ADDRESS NOT NULL,
	trading_addr ADDRESS NOT NULL UNIQUE,
	winner BYTES32 NOT NULL
);

CREATE TABLE ninelives_events_dao_money_distributed(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	amount HUGEINT NOT NULL,
	recipient ADDRESS NOT NULL
);

CREATE TABLE ninelives_events_committed(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	trading ADDRESS NOT NULL,
	predictor ADDRESS NOT NULL,
	commitment BYTES32 NOT NULL
);

CREATE INDEX ON ninelives_events_committed(trading);

CREATE TABLE ninelives_events_commitment_revealed(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	trading ADDRESS NOT NULL,
	revealer ADDRESS NOT NULL UNIQUE,
	outcome BYTES32 NOT NULL,
	caller ADDRESS NOT NULL,
	bal HUGEINT NOT NULL
);

CREATE TABLE ninelives_events_campaign_escaped(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	trading_addr ADDRESS NOT NULL UNIQUE
);

CREATE TABLE ninelives_events_locked_up(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	amount HUGEINT NOT NULL,
	recipient ADDRESS NOT NULL
);

CREATE INDEX ON ninelives_events_locked_up(recipient);

CREATE TABLE ninelives_events_withdrew(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	amount HUGEINT NOT NULL,
	recipient ADDRESS NOT NULL
);

CREATE INDEX ON ninelives_events_withdrew(recipient);

CREATE TABLE ninelives_events_slashed(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	victim ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	slashed_amount HUGEINT NOT NULL
);

CREATE INDEX ON ninelives_events_slashed(victim);

CREATE TABLE ninelives_events_frozen(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	victim ADDRESS NOT NULL,
	recipient TIMESTAMP NOT NULL
);

CREATE INDEX ON ninelives_events_frozen(victim);

-- migrate:down
