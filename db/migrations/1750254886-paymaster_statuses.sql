-- migrate:up

CREATE TABLE ninelives_paymaster_attempts_1 (
	id SERIAL PRIMARY KEY,
	created_by TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	poll_id INTEGER NOT NULL REFERENCES ninelives_paymaster_poll_1(id),
	success BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE VIEW ninelives_paymaster_poll_outstanding_1 AS
SELECT p.*
FROM ninelives_paymaster_poll_1 p
LEFT JOIN (
	SELECT poll_id,
		   COUNT(*)		AS tries,
		   BOOL_OR(success) AS any_success
	FROM ninelives_paymaster_attempts_1
	GROUP BY poll_id
) a ON a.poll_id = p.id
WHERE COALESCE(a.tries, 0) < 5
AND NOT COALESCE(a.any_success, FALSE);

-- migrate:down
