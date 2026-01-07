-- migrate:up

CREATE TABLE ninelives_market_odds_snapshot_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	pool_address ADDRESS NOT NULL,
	odds JSONB NOT NULL
);

CREATE TABLE ninelives_market_summaries_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	pool_address ADDRESS NOT NULL UNIQUE,
	odds JSONB NOT NULL
);

CREATE INDEX ON ninelives_market_odds_snapshot_1 (pool_address);

CREATE FUNCTION ninelives_market_odds_summaries_1()
RETURNS TRIGGER AS $$
DECLARE
	current_total NUMERIC;
	updated_odds JSONB;
BEGIN
	SELECT COALESCE((odds->>NEW.identifier::text)::NUMERIC, 0)
	INTO current_total
	FROM ninelives_market_summaries_1
	WHERE pool_address = NEW.emitter_addr;
	current_total := current_total + NEW.fusdc_spent;
	SELECT COALESCE(odds, '{}'::JSONB) || jsonb_build_object(NEW.identifier::text, current_total::text)
	INTO updated_odds
	FROM ninelives_market_summaries_1
	WHERE pool_address = NEW.emitter_addr;
	IF updated_odds IS NULL THEN
		updated_odds := jsonb_build_object(NEW.identifier::text, NEW.fusdc_spent::text);
	END IF;
	INSERT INTO ninelives_market_summaries_1 (pool_address, odds)
	VALUES (NEW.emitter_addr, updated_odds)
	ON CONFLICT (pool_address) DO UPDATE
	SET odds = EXCLUDED.odds,
		created_by = CURRENT_TIMESTAMP;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ninelives_market_odds_summaries_trigger_1
AFTER INSERT ON ninelives_events_shares_minted
FOR EACH ROW
EXECUTE FUNCTION ninelives_market_odds_summaries_1();

CREATE OR REPLACE FUNCTION ninelives_create_snapshot_from_summary_1()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO ninelives_market_odds_snapshot_1 (pool_address, odds)
	VALUES (NEW.pool_address, NEW.odds);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ninelives_trigger_create_snapshot
AFTER INSERT OR UPDATE ON ninelives_market_summaries_1
FOR EACH ROW
EXECUTE FUNCTION ninelives_create_snapshot_from_summary_1();

CREATE TABLE ninelives_events_shares_minted2(
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	block_hash HASH NOT NULL,
	transaction_hash HASH NOT NULL,
	block_number INTEGER NOT NULL,
	emitter_addr ADDRESS NOT NULL,

	identifier BYTES8 NOT NULL,
	share_amount HUGEINT NOT NULL,
	spender ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	fusdc_spent HUGEINT NOT NULL
);

CREATE TRIGGER ninelives_market_odds_summaries_trigger_1
AFTER INSERT ON ninelives_events_shares_minted2
FOR EACH ROW
EXECUTE FUNCTION ninelives_market_odds_summaries_1();

INSERT INTO ninelives_events_shares_minted2 (
	block_hash,
	transaction_hash,
	block_number,
	emitter_addr,
	identifier,
	share_amount,
	spender,
	recipient,
	fusdc_spent
)
	SELECT
		block_hash,
		transaction_hash,
		block_number,
		emitter_addr,
		identifier,
		share_amount,
		spender,
		recipient,
		fusdc_spent
	FROM ninelives_events_shares_minted;

DROP TRIGGER ninelives_market_odds_summaries_trigger_1 ON ninelives_events_shares_minted2;

DROP TABLE ninelives_events_shares_minted2;

-- migrate:down
