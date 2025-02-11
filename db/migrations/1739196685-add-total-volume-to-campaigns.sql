-- migrate:up

ALTER TABLE ninelives_campaigns_1
ADD COLUMN total_volume HUGEINT NOT NULL DEFAULT 2000000;

CREATE FUNCTION ninelives_update_total_volume_after_mint()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	UPDATE ninelives_campaigns_1 AS nc
	SET total_volume = nc.total_volume + NEW.fusdc_spent
	WHERE NEW.emitter_addr = nc.content->>'poolAddress';

	RETURN NEW;
END $$;

CREATE TRIGGER ninelives_trigger_update_total_volume_for_campaigns_on_mint
AFTER INSERT ON ninelives_events_shares_minted
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_total_volume_after_mint();

-- migrate:down

ALTER TABLE ninelives_campaigns_1
DROP COLUMN total_volume;

DROP TRIGGER IF EXISTS
ninelives_trigger_update_total_volume_for_campaigns_on_mint
ON ninelives_events_shares_minted;

DROP FUNCTION IF EXISTS ninelives_update_total_volume_after_mint();
