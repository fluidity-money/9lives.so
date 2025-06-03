-- migrate:up

DROP VIEW IF EXISTS ninelives_frontpage_delta_view_1;

CREATE OR REPLACE FUNCTION ninelives_get_featured_campaigns_1(
    interval_value INTERVAL,
    limit_count INTEGER
    )
RETURNS TABLE (
    id TEXT,
	created_at TIMESTAMP ,
	updated_at TIMESTAMP,
	content JSONB,
    name_to_search TEXT,
    shown bool,
    total_volume HUGEINT,
    total_liquidity HUGEINT,
    liquidity_last_hour HUGEINT
) AS $$
BEGIN
    RETURN QUERY
    WITH liquidity_changes AS (
        SELECT emitter_addr AS pool, created_by, fusdc_amt AS delta_liquidity
        FROM ninelives_events_liquidity_added
        UNION ALL
        SELECT emitter_addr AS pool, created_by, -fusdc_amt AS delta_liquidity
        FROM ninelives_events_liquidity_removed
        UNION ALL
        SELECT emitter_addr AS pool, created_by, -fusdc_amt AS delta_liquidity
        FROM ninelives_events_liquidity_claimed
    ),
    hourly_change AS (
        SELECT
            pool,
            SUM(ABS(delta_liquidity)) AS liquidity_last_hour
        FROM liquidity_changes
        WHERE created_by >= NOW() - interval_value
        GROUP BY pool
    ),
    current_liquidity AS (
        SELECT
            pool,
            SUM(delta_liquidity) AS total_liquidity
        FROM liquidity_changes
        GROUP BY pool
    ),
    campaigns_with_liquidity AS (
        SELECT 
            c.*,
            COALESCE(cl.total_liquidity, 0)::HUGEINT AS total_liquidity,
            COALESCE(hc.liquidity_last_hour, 0)::HUGEINT AS liquidity_last_hour
        FROM ninelives_campaigns_1 c
        LEFT JOIN current_liquidity cl ON c.content->>'poolAddress' = cl.pool
        LEFT JOIN hourly_change hc ON c.content->>'poolAddress' = hc.pool
    )
    SELECT *
    FROM campaigns_with_liquidity
    ORDER BY liquidity_last_hour DESC, total_liquidity DESC, total_volume DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- migrate:down
