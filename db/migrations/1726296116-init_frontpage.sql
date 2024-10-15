-- migrate:up

-- Campaigns that were created, and are accessible somehow.

CREATE TABLE ninelives_campaigns_1 (
	id TEXT PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	content JSONB NOT NULL
);

-- Frontpage state deserialised, and displayed literally on the landing page.

CREATE TABLE ninelives_frontpage_1 (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	until TIMESTAMP NOT NULL,
	campaign_id TEXT NOT NULL,
	CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES ninelives_campaigns_1(id)
);

CREATE INDEX ON ninelives_frontpage_1 (created_at);

CREATE INDEX ON ninelives_frontpage_1 (until);

-- migrate:down
