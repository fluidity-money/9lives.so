-- migrate:up

CREATE TABLE ninelives_events_ninetails_boosted_shares_received(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	spender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	amount_received HUGEINT NOT NULL,
	outcome BYTES8 NOT NULL
);

CREATE INDEX ON ninelives_events_ninetails_boosted_shares_received (
	outcome
);

CREATE INDEX ON ninelives_events_ninetails_boosted_shares_received (
	recipient
);

CREATE TABLE ninelives_events_ninetails_cumulative_winner_payoff(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	spender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	shares_spent HUGEINT NOT NULL,
	fusdc_received HUGEINT NOT NULL,
	outcome BYTES8 NOT NULL
);

CREATE INDEX ON ninelives_events_ninetails_cumulative_winner_payoff (
	outcome
);

CREATE INDEX ON ninelives_events_ninetails_cumulative_winner_payoff (
	recipient
);

CREATE TABLE ninelives_events_ninetails_loser_payoff(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	spender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	shares_spent HUGEINT NOT NULL,
	fusdc_received HUGEINT NOT NULL,
	outcome BYTES8 NOT NULL
);

CREATE TABLE ninelives_events_dppm_clawback(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	recipient ADDRESS NOT NULL,
	fusdc_clawback HUGEINT NOT NULL
);

-- migrate:down
