-- migrate:up

CREATE OR REPLACE FUNCTION ninelives_fn_campaign_seed_liquidity_1()
RETURNS TRIGGER AS $$
DECLARE
	v_pool_address TEXT;
	v_fusdc_amt NUMERIC;
	v_outcomes JSONB;
	v_num_outcomes INT;
	v_share NUMERIC;
	v_updated_outcomes JSONB;
	i INT;
BEGIN
	IF NEW.content->>'isDppm' != 'true' THEN
		RETURN NEW;
	END IF;

	v_pool_address := NEW.content->>'poolAddress';
	v_outcomes := NEW.content->'outcomes';
	v_num_outcomes := jsonb_array_length(v_outcomes);

	SELECT sel.fusdc_amt::NUMERIC
	  INTO v_fusdc_amt
	  FROM ninelives_events_seed_liquidity_added sel
	 WHERE sel.emitter_addr = v_pool_address
	 ORDER BY sel.block_number DESC
	 LIMIT 1;

	IF v_fusdc_amt IS NULL THEN
		RETURN NEW;
	END IF;

	v_share := v_fusdc_amt / 2;

	v_updated_outcomes := '[]'::JSONB;
	FOR i IN 0..(v_num_outcomes - 1) LOOP
		v_updated_outcomes := v_updated_outcomes || jsonb_build_array(
			(v_outcomes->i) || jsonb_build_object('seedLiquidity', v_share)
		);
	END LOOP;

	NEW.content := jsonb_set(NEW.content, '{outcomes}', v_updated_outcomes);

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ninelives_trg_campaign_seed_liquidity_1
BEFORE INSERT ON ninelives_campaigns_1
FOR EACH ROW
EXECUTE FUNCTION ninelives_fn_campaign_seed_liquidity_1();

-- migrate:down
