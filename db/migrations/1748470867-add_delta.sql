-- migrate:up

CREATE VIEW ninelives_frontpage_delta_view_1 AS
	WITH liquidity_changes AS (
		SELECT pool, created_by, liquidity AS delta_liquidity
		FROM camelot_events_camelot_increaseliquidity

		UNION ALL

		SELECT emitter_addr AS pool, created_by, -liquidity AS delta_liquidity
		FROM camelot_events_camelot_decreaseliquidity
	),

	hourly_volume AS (
		SELECT
			pool,
			SUM(ABS(delta_liquidity)) AS volume_last_hour
		FROM liquidity_changes
		WHERE created_by >= NOW() - INTERVAL '1 hour'
		GROUP BY pool
	),

	current_liquidity AS (
		SELECT
			pool,
			SUM(delta_liquidity) AS total_liquidity
		FROM liquidity_changes
		GROUP BY pool
	),

	buys_sells_volume AS (
		SELECT
			outcome_id AS pool,
			SUM(from_amount) AS buys_sells_volume
		FROM ninelives_buys_and_sells_1
		WHERE shown = true
		GROUP BY outcome_id
	),

	combined_pools AS (
		SELECT DISTINCT pool FROM (
			SELECT pool FROM current_liquidity
			UNION
			SELECT pool FROM buys_sells_volume
		) AS all_pools
	),

	ranked_pools AS (
		SELECT
			cp.pool,
			COALESCE(hv.volume_last_hour, 0) AS volume_last_hour,
			COALESCE(cl.total_liquidity, 0) AS total_liquidity,
			COALESCE(bsv.buys_sells_volume, 0) AS buys_sells_volume
		FROM combined_pools cp
		LEFT JOIN hourly_volume hv ON cp.pool = hv.pool
		LEFT JOIN current_liquidity cl ON cp.pool = cl.pool
		LEFT JOIN buys_sells_volume bsv ON cp.pool = bsv.pool
	),

	final_selection AS (
		SELECT bs.*,
					 rp.volume_last_hour,
					 rp.total_liquidity,
					 rp.buys_sells_volume
		FROM ninelives_buys_and_sells_1 bs
		JOIN ranked_pools rp ON bs.outcome_id = rp.pool
		WHERE bs.shown = true
	)

	SELECT *
	FROM final_selection
	ORDER BY volume_last_hour DESC, total_liquidity DESC, buys_sells_volume DESC;

-- migrate:down
