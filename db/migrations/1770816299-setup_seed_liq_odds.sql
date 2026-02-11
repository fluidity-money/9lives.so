-- migrate:up

CREATE OR REPLACE FUNCTION ninelives_seed_liquidity_on_campaign_insert_1()
RETURNS TRIGGER AS $$
DECLARE
	pool_addr TEXT;
	is_dppm BOOLEAN;
	seed_fusdc NUMERIC;
	outcomes JSONB;
	outcome_count INT;
	per_outcome_amt NUMERIC;
	outcome JSONB;
	outcome_id TEXT;
	seed_odds JSONB := '{}'::JSONB;
BEGIN
	is_dppm := (NEW.content->>'isDppm')::BOOLEAN;
	IF NOT COALESCE(is_dppm, FALSE) THEN
		RETURN NEW;
	END IF;

	pool_addr := NEW.content->>'poolAddress';
	IF pool_addr IS NULL THEN
		RETURN NEW;
	END IF;

	SELECT fusdc_amt::NUMERIC
	INTO seed_fusdc
	FROM ninelives_events_seed_liquidity_added
	WHERE emitter_addr = pool_addr
	ORDER BY block_number DESC
	LIMIT 1;

	IF seed_fusdc IS NULL THEN
		RETURN NEW;
	END IF;

	outcomes := NEW.content->'outcomes';
	IF outcomes IS NULL OR jsonb_typeof(outcomes) != 'array' THEN
		RETURN NEW;
	END IF;

	outcome_count := jsonb_array_length(outcomes);
	IF outcome_count = 0 THEN
		RETURN NEW;
	END IF;

	per_outcome_amt := seed_fusdc / outcome_count;

	FOR outcome IN SELECT * FROM jsonb_array_elements(outcomes)
	LOOP
		outcome_id := outcome->>'identifier';
		IF outcome_id IS NOT NULL THEN
			seed_odds := seed_odds || jsonb_build_object(outcome_id, per_outcome_amt::TEXT);
		END IF;
	END LOOP;

	IF seed_odds = '{}'::JSONB THEN
		RETURN NEW;
	END IF;

	INSERT INTO ninelives_market_summaries_1 (pool_address, odds)
	VALUES (pool_addr, seed_odds)
	ON CONFLICT (pool_address) DO UPDATE
	SET odds = ninelives_market_summaries_1.odds || EXCLUDED.odds,
		created_by = CURRENT_TIMESTAMP;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ninelives_seed_liquidity_on_campaign_insert_trigger_1
AFTER INSERT ON ninelives_campaigns_1
FOR EACH ROW
EXECUTE FUNCTION ninelives_seed_liquidity_on_campaign_insert_1();

-- migrate:down
