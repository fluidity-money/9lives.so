-- migrate:up

-- TODO: move back to a normal table.

CREATE UNIQUE INDEX ON ninelives_campaigns_1((content->>'poolAddress'));

-- migrate:down
