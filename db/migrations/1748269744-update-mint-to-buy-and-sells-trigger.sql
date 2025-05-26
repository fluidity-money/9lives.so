-- migrate:up

DROP TRIGGER IF EXISTS
ninelives_trigger_ninelives_events_shares_minted_to_ninelives_buys_and_sells_1
ON ninelives_events_shares_minted;
DROP FUNCTION IF EXISTS
NINELIVES_FUN_NINELIVES_EVENTS_SHARES_MINTED_TO_NINELIVES_BUYS_AND_SELLS_1();

CREATE FUNCTION
NINELIVES_FUN_NINELIVES_EVENTS_SHARES_MINTED_TO_NINELIVES_BUYS_AND_SELLS_2()
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

	SELECT SUM(total) as total_vol
    INTO total_volume
    FROM (
      SELECT COALESCE(SUM(fusdc_spent), 0) AS total
      FROM ninelives_events_shares_minted
      WHERE emitter_addr = NEW.emitter_addr
      UNION ALL
      SELECT COALESCE(SUM(fusdc_returned), 0) AS total
      FROM ninelives_events_shares_burned
      WHERE emitter_addr = NEW.emitter_addr
      union all 
      SELECT COALESCE(SUM(fusdc_amt), 0) AS total
      FROM ninelives_events_liquidity_added
      WHERE emitter_addr = NEW.emitter_addr
    ) AS combined_totals;

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
ninelives_trigger_ninelives_events_shares_minted_to_ninelives_buys_and_sells_2
AFTER INSERT ON ninelives_events_shares_minted
FOR EACH ROW
EXECUTE FUNCTION
NINELIVES_FUN_NINELIVES_EVENTS_SHARES_MINTED_TO_NINELIVES_BUYS_AND_SELLS_2();

-- migrate:down
