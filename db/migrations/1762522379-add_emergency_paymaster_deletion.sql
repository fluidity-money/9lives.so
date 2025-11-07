-- migrate:up

CREATE FUNCTION ninelives_emergency_wipe_1() RETURNS VOID AS $$
BEGIN
	DELETE FROM ninelives_paymaster_poll_1
	WHERE id NOT IN (
		SELECT poll_id FROM ninelives_paymaster_attempts_2
	);
END;
$$ LANGUAGE plpgsql;

-- migrate:down
