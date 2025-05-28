-- migrate:up

CREATE VIEW ninelives_frontpage_delta_view_1 AS
	WITH interval_volume AS (
		SELECT
			outcome_id,
			DATE_TRUNC('minute', created_by) -
				INTERVAL '1 minute' * (EXTRACT(minute FROM created_by)::int % 10) AS interval,
			SUM(from_amount) AS volume
		FROM ninelives_buys_and_sells_1
		GROUP BY outcome_id, interval
	),
	interval_deltas AS (
		SELECT
			outcome_id,
			interval,
			volume,
			volume - LAG(volume, 1, 0) OVER (PARTITION BY outcome_id ORDER BY interval) AS delta
		FROM interval_volume
	)
	SELECT *
	FROM interval_deltas
	ORDER BY delta DESC;

-- migrate:down
