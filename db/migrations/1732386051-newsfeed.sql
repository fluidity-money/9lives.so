-- migrate:up

CREATE TABLE ninelives_newsfeed_1(
	id SERIAL PRIMARY KEY,
	headline VARCHAR NOT NULL,
	date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON ninelives_newsfeed_1 (date);

-- migrate:down
