-- migrate:up

CREATE FUNCTION update_campaign_for_winner()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	UPDATE ninelives_buys_and_sells_1
	SET winner = NEW.identifier
	WHERE emitter_addr = NEW.emitter_addr;

	RETURN NEW;
END $$;

CREATE TRIGGER ninelives_trigger_update_campaign_for_winner
AFTER INSERT ON ninelives_events_outcome_decided
FOR EACH ROW
EXECUTE FUNCTION update_campaign_for_winner();

-- migrate:down
