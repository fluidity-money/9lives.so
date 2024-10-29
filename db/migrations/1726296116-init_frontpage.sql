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
	FOREIGN KEY (campaign_id) REFERENCES ninelives_campaigns_1(id)
);

CREATE TABLE ninelives_categories_1 (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE ninelives_campaigns_categories_1 (
	campaign_id TEXT NOT NULL,
	category_id INT NOT NULL,
	PRIMARY KEY (campaign_id, category_id),
	FOREIGN KEY (campaign_id) REFERENCES ninelives_campaigns_1(id),
	FOREIGN KEY (category_id) REFERENCES ninelives_categories_1(id)
);

CREATE INDEX ON ninelives_frontpage_1 ("from");
CREATE INDEX ON ninelives_frontpage_1 (until);
CREATE INDEX ON ninelives_campaigns_categories_1 (category_id);

INSERT INTO ninelives_categories_1 (name, created_at, updated_at) VALUES 
('Politics', NOW(), NOW()), 
('Crypto',NOW(), NOW()), 
('Pop Culture',NOW(), NOW());

CREATE OR REPLACE FUNCTION queryCampaigns_1(categories TEXT[] DEFAULT NULL)
RETURNS TABLE (id TEXT, content JSONB, category_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT c.id, c.content, cat.name AS category_name
    FROM ninelives_campaigns_1 c
    JOIN ninelives_campaigns_categories_1 cc ON c.id = cc.campaign_id
    JOIN ninelives_categories_1 cat ON cc.category_id = cat.id
    WHERE categories IS NULL OR cat.name = ANY (categories);
END;
$$ LANGUAGE plpgsql;
-- migrate:down
