-- migrate:up

CREATE TABLE ninelives_oracle_metadata_1(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	campaign_id BYTES8 NOT NULL UNIQUE,
	FOREIGN KEY (campaign_id) REFERENCES ninelives_campaigns_1(id),
	-- For the current method of looking up price, we use a centralised service.
	price_sym VARCHAR,
	price_source VARCHAR,
	should_be_invoked_at TIMESTAMP NOT NULL,
	was_invoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- migrate:down
