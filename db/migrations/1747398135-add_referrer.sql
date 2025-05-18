-- migrate:up

CREATE TABLE ninelives_referrer_1 (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	creator_ip VARCHAR NOT NULL,
	owner ADDRESS NOT NULL,
	code VARCHAR(50) NOT NULL UNIQUE
);

-- migrate:down
