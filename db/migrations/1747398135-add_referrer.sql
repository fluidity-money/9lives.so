-- migrate:up

CREATE TABLE ninelives_referrer_1 (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	owner ADDRESS NOT NULL,
	code VARCHAR NOT NULL UNIQUE
);

-- migrate:down
