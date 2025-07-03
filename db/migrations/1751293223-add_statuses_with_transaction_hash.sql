-- migrate:up

CREATE TABLE ninelives_paymaster_attempts_2 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	poll_id INTEGER NOT NULL REFERENCES ninelives_paymaster_poll_1(id),
	success BOOLEAN NOT NULL DEFAULT FALSE,
	transaction_hash HASH
);

CREATE VIEW ninelives_paymaster_poll_outstanding_2 AS
SELECT p.*
FROM ninelives_paymaster_poll_1 p
LEFT JOIN (
	SELECT poll_id,
		   COUNT(*)		AS tries,
		   BOOL_OR(success) AS any_success
	FROM ninelives_paymaster_attempts_2
	GROUP BY poll_id
) a ON a.poll_id = p.id
WHERE COALESCE(a.tries, 0) < 5
AND NOT COALESCE(a.any_success, FALSE);

CREATE FUNCTION ninelives_paymaster_track_result_2(
	p_poll_id INTEGER,
	p_success BOOLEAN,
	hash HASH
) RETURNS VOID AS $$
BEGIN
	INSERT INTO ninelives_paymaster_attempts_2 (poll_id, success, transaction_hash)
	VALUES (p_poll_id, p_success, hash);
END;
$$ LANGUAGE plpgsql;

-- migrate:down
