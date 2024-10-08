-- migrate:up

-- Campaigns that were created, and are accessible somehow.

CREATE TABLE campaigns_1 (
	id TEXT PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	content JSONB NOT NULL
);

-- Frontpage state deserialised, and displayed literally on the landing page.

CREATE TABLE frontpage (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	until TIMESTAMP NOT NULL,
	campaign_id TEXT NOT NULL,
	CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns_1(id)
);

CREATE INDEX ON frontpage (created_at);

CREATE INDEX ON frontpage (until);

-- migrate:down
