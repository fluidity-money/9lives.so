-- migrate:up

CREATE TABLE ninelives_market_odds_snapshot_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	pool_address ADDRESS NOT NULL,
	odds JSONB NOT NULL
);

CREATE INDEX ON ninelives_market_odds_snapshot_1 (pool_address);

CREATE OR REPLACE FUNCTION ninelives_update_market_odds_snapshot_1 ()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO ninelives_market_odds_snapshot_1 (pool_address, odds)
	SELECT
		NEW.emitter_addr,
		jsonb_object_agg(
			identifier::text,
			total_spent
		) AS odds
	FROM (
		SELECT
			identifier,
			SUM(fusdc_spent) AS total_spent
		FROM ninelives_events_shares_minted
		WHERE emitter_addr = NEW.emitter_addr
		GROUP BY identifier
	) AS aggregated_data
	ON CONFLICT (pool_address)
	DO UPDATE SET
		odds = EXCLUDED.odds,
		created_by = CURRENT_TIMESTAMP;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ninelives_update_market_odds_snapshot_trigger_1
AFTER INSERT ON ninelives_events_shares_minted
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_market_odds_snapshot_1();

-- migrate:down
