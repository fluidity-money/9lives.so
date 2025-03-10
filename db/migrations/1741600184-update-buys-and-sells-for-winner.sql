-- migrate:up

CREATE FUNCTION ninelives_update_buys_and_sells_for_winner()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	UPDATE ninelives_buys_and_sells_1
	SET campaign_content = jsonb_set(campaign_content, '{winner}', ('"' || '0x' || NEW.identifier || '"')::jsonb)
	WHERE campaign_content->>'poolAddress' = NEW.emitter_addr;

	RETURN NEW;
END $$;

CREATE TRIGGER ninelives_trigger_update_buys_and_sells_for_winner
AFTER INSERT ON ninelives_events_outcome_decided
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_buys_and_sells_for_winner();

-- migrate:down
