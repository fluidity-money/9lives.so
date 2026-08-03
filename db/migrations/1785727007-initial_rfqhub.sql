-- migrate:up

CREATE TABLE rfqhub_events_balance_changed (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,

	account_addr ADDRESS NOT NULL,
	new_balance HUGEINT NOT NULL
);

CREATE INDEX ON rfqhub_events_balance_changed (account_addr, id DESC)
INCLUDE (new_balance);

-- migrate:down
