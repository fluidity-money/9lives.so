-- migrate:up

CREATE TABLE punk_domains_events_default_domain_changed(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	address ADDRESS NOT NULL,
	default_domain VARCHAR NOT NULL
);

CREATE INDEX ON punk_domains_events_default_domain_changed (address);

-- migrate:down
