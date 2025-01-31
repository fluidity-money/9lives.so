-- migrate:up

CREATE TABLE ninelives_banners_1 (
	id SERIAL PRIMARY KEY,
	pool ADDRESS NOT NULL,
	message TEXT NOT NULL
);

-- migrate:down
