-- migrate:up

CREATE VIEW ninelives_view_all_earned_1 AS
	SELECT
		recipient,
		emitter_addr,
		SUM(fusdc_received) as fusdc_received
	FROM (
		SELECT
			recipient,
			emitter_addr,
			fusdc_received
		FROM ninelives_events_ninetails_loser_payoff
		UNION ALL
		SELECT
			recipient,
			emitter_addr,
			fusdc_received
		FROM ninelives_events_ninetails_cumulative_winner_payoff
		UNION ALL
		SELECT
			recipient,
			emitter_addr,
			fusdc_received
		FROM ninelives_events_payoff_activated
	) combined_payoffs
	GROUP BY recipient, emitter_addr
	ORDER BY recipient, fusdc_received DESC;

CREATE TABLE ninelives_all_earned_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	emitter_addr ADDRESS NOT NULL,
	recipient ADDRESS NOT NULL,
	fusdc_received HUGEINT NULL
);

CREATE INDEX ON ninelives_all_earned_1 (emitter_addr);

CREATE INDEX ON ninelives_all_earned_1 (recipient);

CREATE UNIQUE INDEX ON ninelives_all_earned_1 (emitter_addr, recipient);

INSERT INTO ninelives_all_earned_1 (emitter_addr, recipient, fusdc_received)
	SELECT emitter_addr, recipient, fusdc_received FROM ninelives_view_all_earned_1;

CREATE FUNCTION ninelives_update_all_earned_1()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO ninelives_all_earned_1 (emitter_addr, recipient, fusdc_received)
	VALUES (NEW.emitter_addr, NEW.recipient, NEW.fusdc_received)
	ON CONFLICT ON CONSTRAINT ninelives_all_earned_1_emitter_recipient_unique
	DO UPDATE SET
		fusdc_received = ninelives_all_earned_1.fusdc_received + EXCLUDED.fusdc_received,
		updated_by = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE ninelives_all_earned_1
ADD CONSTRAINT ninelives_all_earned_1_emitter_recipient_unique
UNIQUE (emitter_addr, recipient);

CREATE TRIGGER ninelives_update_all_earned_loser_payoff_trigger_1
AFTER INSERT ON ninelives_events_ninetails_loser_payoff
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_all_earned_1();

CREATE TRIGGER ninelives_update_all_earned_cumulative_winner_payoff_trigger_1
AFTER INSERT ON ninelives_events_ninetails_cumulative_winner_payoff
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_all_earned_1();

CREATE TRIGGER ninelives_update_all_earned_payoff_activated_trigger_1
AFTER INSERT ON ninelives_events_payoff_activated
FOR EACH ROW
EXECUTE FUNCTION ninelives_update_all_earned_1();

-- migrate:down
