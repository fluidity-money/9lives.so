-- migrate:up

CREATE INDEX ON ninelives_campaigns_1 (created_at);
CREATE INDEX ON ninelives_campaigns_1 (updated_at);

-- migrate:down
