-- migrate:up

CREATE TABLE ninelives_campaigns_1 (
	id TEXT PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	content JSONB NOT NULL
);

CREATE TABLE ninelives_frontpage_1 (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	"from" TIMESTAMP NOT NULL,
	until TIMESTAMP NOT NULL,
	campaign_id TEXT NOT NULL,
	CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES ninelives_campaigns_1(id)
);

CREATE TABLE ninelives_categories_1 (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE ninelives_campaigns_categories_1 (
	campaign_id INT NOT NULL,
	category_id INT NOT NULL,
	PRIMARY KEY (campaign_id, category_id),
	CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES ninelives_campaigns_1(id),
	CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES ninelives_categories_1(id)
);

CREATE INDEX ON ninelives_frontpage_1 ("from");
CREATE INDEX ON ninelives_frontpage_1 (until);
CREATE INDEX ON ninelives_campaigns_categories_1 (category_id);

-- migrate:down
