-- migrate:up

CREATE OR REPLACE FUNCTION ninelives_update_liquidity_on_campaign_creation_1()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	UPDATE ninelives_campaigns_1
	SET total_volume =
		COALESCE(
			(
				SELECT sum(fusdc_amt) FROM ninelives_events_liquidity_added
				WHERE emitter_addr = NEW.content->>'poolAddress'
			),
			0
		)
		- COALESCE(
			(
				SELECT sum(fusdc_amt) FROM ninelives_events_liquidity_removed
				WHERE emitter_addr = NEW.content->>'poolAddress'
			),
			0
		)
	WHERE content->>'poolAddress' = NEW.content->>'poolAddress';
	RETURN NEW;
END;
$$;

CREATE TRIGGER ninelives_trigger_update_liquidity_on_campaign_creation_1
AFTER INSERT ON ninelives_campaigns_1
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_liquidity_on_campaign_creation_1();


-- migrate:down
