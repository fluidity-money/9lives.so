-- migrate:up

CREATE FUNCTION ninelives_paymaster_track_result_1(
	p_poll_id INTEGER,
	p_success BOOLEAN
) RETURNS VOID AS $$
BEGIN
	INSERT INTO ninelives_paymaster_attempts_1 (poll_id, success)
	VALUES (p_poll_id, p_success);
END;
$$ LANGUAGE plpgsql;

-- migrate:down
