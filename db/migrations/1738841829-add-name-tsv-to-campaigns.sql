-- migrate:up

ALTER TABLE ninelives_campaigns_1
ADD COLUMN name_to_search TEXT
GENERATED ALWAYS AS (content ->> 'name')
STORED;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_ninelives_campaigns_1_name_to_search
ON ninelives_campaigns_1 USING gin (name_to_search gin_trgm_ops);

-- migrate:down

ALTER TABLE ninelives_campaigns_1
DROP COLUMN name_to_search;

DROP INDEX idx_ninelives_campaigns_1_name_to_search;
