-- migrate:up

CREATE FUNCTION ninelives_update_buys_sells_on_create()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
	UPDATE ninelives_buys_and_sells_1
	SET campaign_content = NEW.content
	WHERE emitter_addr = NEW.content->>'poolAddress';

	RETURN NEW;
END $$;

CREATE TRIGGER ninelives_trigger_update_buys_sells_on_create
AFTER INSERT ON ninelives_campaigns_1
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_buys_sells_on_create();

-- migrate:down
