-- migrate:up

CREATE TABLE ninelives_buys_and_sells_1 (
	transaction_hash HASH PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,
	from_amount HUGEINT NOT NULL,
	from_symbol VARCHAR(30) NOT NULL,
	to_amount HUGEINT NOT NULL,
	to_symbol VARCHAR(30) NOT NULL,
	type VARCHAR(4) CHECK (type IN ('buy', 'sell')) NOT NULL,
	spender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	total_volume HUGEINT NOT NULL DEFAULT 0,
	outcome_id BYTES8 NOT NULL,
	campaign_id TEXT REFERENCES ninelives_campaigns_1 (id),
	campaign_content JSONB,
	winner BYTES8 DEFAULT null
);

CREATE INDEX idx_total_volume ON ninelives_buys_and_sells_1 (total_volume);

CREATE FUNCTION
NINELIVES_FUN_NINELIVES_EVENTS_SHARES_MINTED_TO_NINELIVES_BUYS_AND_SELLS_1()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
	campaign_id TEXT;
	campaign_content JSONB;
	total_volume HUGEINT;
BEGIN
 	SELECT id, content
	INTO campaign_id, campaign_content
	FROM ninelives_campaigns_1
	WHERE content->>'poolAddress' = NEW.emitter_addr;

	SELECT SUM(fusdc_spent)
	INTO total_volume
	FROM ninelives_events_shares_minted
	WHERE emitter_addr = NEW.emitter_addr
	GROUP BY emitter_addr;

	INSERT INTO ninelives_buys_and_sells_1 (
		transaction_hash,
		created_by,
		block_hash,
		block_number,
		emitter_addr,
		from_amount,
		from_symbol,
		to_amount,
		to_symbol,
		type,
		spender,
		recipient,
		total_volume,
		outcome_id,
		campaign_id,
		campaign_content
	)
	VALUES (
		NEW.transaction_hash,
		NEW.created_by,
		NEW.block_hash,
		NEW.block_number,
		NEW.emitter_addr,
		NEW.fusdc_spent,
		'fUSDC',
		NEW.share_amount,
		'9#Share',
		'buy',
		NEW.spender,
		NEW.recipient,
		total_volume,
		NEW.identifier,
		campaign_id,
		campaign_content
	);
	RETURN NEW;
END $$;

CREATE TRIGGER
ninelives_trigger_ninelives_events_shares_minted_to_ninelives_buys_and_sells_1
AFTER INSERT ON ninelives_events_shares_minted
FOR EACH ROW
EXECUTE FUNCTION
NINELIVES_FUN_NINELIVES_EVENTS_SHARES_MINTED_TO_NINELIVES_BUYS_AND_SELLS_1();

-- migrate:down
