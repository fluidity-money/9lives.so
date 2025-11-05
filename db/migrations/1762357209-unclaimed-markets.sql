-- migrate:up

-- Simple view that finds every market a user participated in. Should be used to seed the
-- initial table that will be updated to say whether they used the payoff function on the
-- markets they participated in.

CREATE FUNCTION ninelives_not_claimed_payoffs_1(target_address address)
RETURNS TABLE(emitter_addr address) AS $$
BEGIN
	RETURN QUERY
	SELECT DISTINCT sm.emitter_addr
	FROM ninelives_events_shares_minted sm
	WHERE sm.recipient = target_address
	AND EXISTS (
		SELECT 1
		FROM ninelives_events_payoff_activated pa
		WHERE pa.emitter_addr = sm.emitter_addr
		AND pa.identifier = sm.identifier
	)
	AND NOT EXISTS (
		SELECT 1
		FROM ninelives_events_payoff_activated pa
		WHERE pa.emitter_addr = sm.emitter_addr
		AND pa.identifier = sm.identifier
		AND pa.spender = target_address
	)
	AND NOT EXISTS (
		SELECT 1
		FROM ninelives_events_ninetails_loser_payoff nlp
		WHERE nlp.emitter_addr = sm.emitter_addr
		AND nlp.outcome = sm.identifier
		AND nlp.spender = target_address
	);
END;
$$ LANGUAGE plpgsql;

-- This table and the following triggers quickly update this table to make querying simple
-- for end users:

CREATE TABLE ninelives_payoff_unused_1(
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	pool_address ADDRESS NOT NULL,
	spender ADDRESS NOT NULL,
	was_spent BOOL NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX ON ninelives_payoff_unused_1 (pool_address, spender);

CREATE OR REPLACE FUNCTION ninelives_insert_unused_payoff_1()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO ninelives_payoff_unused_1 (pool_address, spender)
	VALUES (NEW.emitter_addr, NEW.recipient)
	ON CONFLICT (pool_address, spender) DO NOTHING;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ninelives_insert_unused_payoff_trigger_1
AFTER INSERT ON ninelives_events_shares_minted
FOR EACH ROW
EXECUTE FUNCTION ninelives_insert_unused_payoff_1();

CREATE OR REPLACE FUNCTION ninelives_mark_payoff_spent_1()
RETURNS TRIGGER AS $$
BEGIN
	UPDATE ninelives_payoff_unused_1
	SET was_spent = TRUE
	WHERE pool_address = NEW.emitter_addr
	AND spender = NEW.spender;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ninelives_mark_payoff_spent_trigger_1
AFTER INSERT ON ninelives_events_payoff_activated
FOR EACH ROW
EXECUTE FUNCTION ninelives_mark_payoff_spent_1();

CREATE TRIGGER ninelives_mark_payoff_spent_trigger_1
AFTER INSERT ON ninelives_events_ninetails_loser_payoff
FOR EACH ROW
EXECUTE FUNCTION ninelives_mark_payoff_spent_1();

INSERT INTO ninelives_payoff_unused_1 (pool_address, spender, was_spent)
SELECT DISTINCT
	unclaimed.emitter_addr as pool_address,
	users.recipient as spender,
	FALSE as was_spent
FROM (SELECT DISTINCT recipient FROM ninelives_events_shares_minted) users
CROSS JOIN LATERAL ninelives_not_claimed_payoffs_1(users.recipient) unclaimed
ON CONFLICT (pool_address, spender) DO NOTHING;

-- migrate:down
