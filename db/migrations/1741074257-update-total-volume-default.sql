-- migrate:up

ALTER TABLE ninelives_campaigns_1
ALTER COLUMN total_volume SET DEFAULT 0;

-- migrate:down
