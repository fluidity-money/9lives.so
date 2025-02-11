-- migrate:up

CREATE INDEX ninelives_campaign_categories_idx
ON ninelives_campaigns_1 USING gin ((content ->> 'categories') jsonb_ops);

-- migrate:down
