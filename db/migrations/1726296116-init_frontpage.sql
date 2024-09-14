-- migrate:up

-- Frontpage state deserialised, and displayed literally on the landing page.

CREATE TABLE frontpage (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP NOT NULL,
	updated_by TIMESTAMP NOT NULL,
	until TIMESTAMP NOT NULL,
	content JSONB NOT NULL
);

CREATE INDEX ON frontpage (created_by);

CREATE INDEX ON frontpage (until);

-- Campaigns that were created, and are accessible somehow.

CREATE TABLE campaigns_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP NOT NULL,
	updated_by TIMESTAMP NOT NULL,
	content JSONB NOT NULL
);

-- Outcomes that are accessible by users.

CREATE TABLE outcomes_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP NOT NULL,
	updated_by TIMESTAMP NOT NULL,
	content JSONB NOT NULL
);

-- migrate:down
