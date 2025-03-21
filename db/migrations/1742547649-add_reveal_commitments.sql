-- migrate:up

CREATE TABLE ninelives_revealed_commitments_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	trading_addr ADDRESS NOT NULL,
	sender ADDRESS NOT NULL,
	seed HUGEINT NOT NULL,
	preferred_outcome BYTES8 NOT NULL
);

CREATE INDEX ON ninelives_revealed_commitments_1(trading_addr);

-- migrate:down
