-- migrate:up

-- Creating these types if they don't exist, so that we can share them with Longtail.

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_type WHERE typname = 'hugeint'
	) THEN
		CREATE DOMAIN HUGEINT AS NUMERIC(78, 0);
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_type WHERE typname = 'address'
	) THEN
		CREATE DOMAIN ADDRESS AS CHAR(42);
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_type WHERE typname = 'hash'
	) THEN
		CREATE DOMAIN HASH AS CHAR(66);
	END IF;


	IF NOT EXISTS (
		SELECT 1 FROM pg_type WHERE typname = 'bytes8'
	) THEN
		CREATE DOMAIN BYTES8 AS CHAR(16);
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_type WHERE typname = 'bytes32'
	) THEN
		CREATE DOMAIN BYTES32 AS CHAR(64);
	END IF;
END $$;

CREATE TABLE ninelives_ingestor_checkpointing_1 (
	id SERIAL PRIMARY KEY,
	last_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	block_number INTEGER NOT NULL
);

CREATE TABLE ninelives_tracked_trading_contracts_1(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	-- Block hash that this tracking happened in.
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	-- The trading address to track as a creation of this factory.
	trading_addr ADDRESS NOT NULL UNIQUE
);

CREATE TABLE ninelives_events_new_trading(
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

CREATE TABLE ninelives_events_outcome_created(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	trading_identifier BYTES32 NOT NULL,
	erc20_identifier BYTES32 NOT NULL UNIQUE,
	erc20_addr BYTES32 NOT NULL UNIQUE
);

CREATE TABLE ninelives_events_outcome_decided(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	identifier BYTES8 NOT NULL,
	oracle ADDRESS NOT NULL,

	UNIQUE (emitter_addr, identifier)
);

CREATE TABLE ninelives_events_shares_minted(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	identifier BYTES32 NOT NULL UNIQUE,
	share_amount HUGEINT NOT NULL,
	spender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	fusdc_spent HUGEINT NOT NULL
);

CREATE TABLE ninelives_events_payoff_activated(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	identifier BYTES32 NOT NULL UNIQUE,
	shares_spent HUGEINT NOT NULL,
	spender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	fusdc_received HUGEINT NOT NULL
);

-- migrate:down
