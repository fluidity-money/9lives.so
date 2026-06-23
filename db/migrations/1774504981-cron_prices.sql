-- migrate:up

DO $outer$
BEGIN
	IF current_database() = 'defaultdb' THEN
		PERFORM cron.schedule(
			'ninelives-delete-old-prices',
			'*/30 * * * *',
			$job$
			DELETE FROM oracles_ninelives_prices_3
			WHERE created_by < NOW() - INTERVAL '2 hours'
			$job$
		);
	END IF;
END;
$outer$;

-- migrate:down
