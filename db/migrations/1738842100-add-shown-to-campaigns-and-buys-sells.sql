-- migrate:up

ALTER TABLE ninelives_campaigns_1
ADD COLUMN shown bool DEFAULT true;

ALTER TABLE ninelives_buys_and_sells_1
ADD COLUMN shown bool DEFAULT true;

-- migrate:down

ALTER TABLE ninelives_campaigns_1
DROP COLUMN shown;

ALTER TABLE ninelives_buys_and_sells_1
DROP COLUMN shown;
