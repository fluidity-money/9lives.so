-- migrate:up

CREATE FUNCTION ninelives_update_total_volume_after_burn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	UPDATE ninelives_campaigns_1 AS nc
	SET total_volume = nc.total_volume + NEW.fusdc_returned
	WHERE NEW.emitter_addr = nc.content->>'poolAddress';

	RETURN NEW;
END $$;

CREATE TRIGGER ninelives_trigger_update_total_volume_for_campaigns_on_burn
AFTER INSERT ON ninelives_events_shares_burned
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_total_volume_after_burn();

CREATE FUNCTION ninelives_update_total_volume_after_stake()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	UPDATE ninelives_campaigns_1 AS nc
	SET total_volume = nc.total_volume + NEW.fusdc_amt
	WHERE NEW.emitter_addr = nc.content->>'poolAddress';

	RETURN NEW;
END $$;

CREATE TRIGGER ninelives_trigger_update_total_volume_for_campaigns_on_stake
AFTER INSERT ON ninelives_events_liquidity_added
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_total_volume_after_stake();

-- migrate:down
