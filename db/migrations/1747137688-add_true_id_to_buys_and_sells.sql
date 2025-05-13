-- migrate:up

ALTER TABLE ninelives_buys_and_sells_1
DROP CONSTRAINT ninelives_buys_and_sells_1_pkey;

ALTER TABLE ninelives_buys_and_sells_1
ADD COLUMN id SERIAL;

UPDATE ninelives_buys_and_sells_1
SET id = nextval('ninelives_buys_and_sells_1_id_seq')
WHERE id IS NULL;

ALTER TABLE ninelives_buys_and_sells_1
ALTER COLUMN id SET NOT NULL,
ADD PRIMARY KEY (id);

-- migrate:down
