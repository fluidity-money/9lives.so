SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: timescaledb; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA public;


--
-- Name: EXTENSION timescaledb; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION timescaledb IS 'Enables scalable inserts and complex queries for time-series data (Community Edition)';


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: address; Type: DOMAIN; Schema: public; Owner: -
--

CREATE DOMAIN public.address AS character(42);


--
-- Name: hash; Type: DOMAIN; Schema: public; Owner: -
--

CREATE DOMAIN public.hash AS character(66);


--
-- Name: hugeint; Type: DOMAIN; Schema: public; Owner: -
--

CREATE DOMAIN public.hugeint AS numeric(78,0);


--
-- Name: erc20_insert_1(public.address, character varying, character varying, public.hugeint, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.erc20_insert_1(a public.address, n character varying, s character varying, t public.hugeint, d integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	INSERT INTO erc20_cache_1 (address, name, symbol, total_supply, decimals)
	VALUES (a, n, s, t, d)
	ON CONFLICT (address) DO NOTHING;
END $$;


--
-- Name: refresh_swap_price_volume_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_swap_price_volume_views() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	REFRESH MATERIALIZED VIEW seawater_pool_swap2_price_hourly_1;
	REFRESH MATERIALIZED VIEW seawater_swaps_average_price_hourly_1;
	REFRESH MATERIALIZED VIEW seawater_pool_swap_volume_hourly_1;
	REFRESH MATERIALIZED VIEW seawater_pool_swap_volume_daily_1;
	REFRESH MATERIALIZED VIEW seawater_pool_swap_volume_monthly_1;
END $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: seawater_swaps_1_return; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_swaps_1_return (
    id integer NOT NULL,
    "timestamp" public.hugeint NOT NULL,
    sender character varying NOT NULL,
    token_in character varying NOT NULL,
    token_out character varying NOT NULL,
    amount_in public.hugeint NOT NULL,
    amount_out public.hugeint NOT NULL,
    token_out_decimals public.hugeint NOT NULL,
    token_in_decimals public.hugeint NOT NULL
);


--
-- Name: seawater_swaps_1(public.address, public.hugeint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seawater_swaps_1(fusdcaddress public.address, fusdcdecimals public.hugeint) RETURNS SETOF public.seawater_swaps_1_return
    LANGUAGE sql STABLE
    AS $$
SELECT
		swaps.id,
		swaps.timestamp,
		swaps.sender,
		swaps.token_in,
		swaps.token_out,
		swaps.amount_in,
		swaps.amount_out,
	COALESCE(toPool.decimals, fusdcDecimals) AS token_out_decimals,
	COALESCE(fromPool.decimals, fusdcDecimals) AS token_in_decimals
FROM (
	SELECT
		id,
		FLOOR(EXTRACT(EPOCH FROM created_by)) AS timestamp,
		user_ AS sender,
		from_ AS token_in,
		to_ AS token_out,
		amount_in,
		amount_out
	FROM
		events_seawater_swap2
	UNION ALL
	SELECT
		id,
		FLOOR(EXTRACT(EPOCH FROM created_by)) AS timestamp,
		user_,
		CASE
			WHEN zero_for_one THEN pool
			ELSE fusdcAddress
		END AS from,
		CASE
			WHEN zero_for_one THEN fusdcAddress
			ELSE pool
		END AS to,
		CASE
			WHEN zero_for_one THEN amount0
			ELSE amount1
		END AS amount_in,
		CASE
			WHEN zero_for_one THEN amount1
			ELSE amount0
		END AS amount_out
	FROM
		events_seawater_swap1
) swaps
LEFT JOIN events_seawater_newpool fromPool
	ON swaps.token_in = fromPool.token
LEFT JOIN events_seawater_newpool toPool
	ON swaps.token_out = toPool.token;
$$;


--
-- Name: seawater_swaps_2_return; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_swaps_2_return (
    created_by timestamp without time zone NOT NULL,
    sender public.address NOT NULL,
    token_in public.address NOT NULL,
    token_out public.address NOT NULL,
    amount_in public.hugeint NOT NULL,
    amount_out public.hugeint NOT NULL,
    token_out_decimals public.hugeint NOT NULL,
    token_in_decimals public.hugeint NOT NULL
);


--
-- Name: seawater_swaps_pool_1(public.address, public.hugeint, public.address, timestamp without time zone, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seawater_swaps_pool_1(fusdcaddress public.address, fusdcdecimals public.hugeint, filter public.address, after timestamp without time zone, limit_ integer) RETURNS SETOF public.seawater_swaps_2_return
    LANGUAGE sql STABLE
    AS $$
SELECT
	swaps.created_by,
	swaps.sender,
	swaps.token_in,
	swaps.token_out,
	swaps.amount_in,
	swaps.amount_out,
	COALESCE(toPool.decimals, fusdcDecimals) AS token_out_decimals,
	COALESCE(fromPool.decimals, fusdcDecimals) AS token_in_decimals
FROM (
	(
		SELECT
			created_by,
			user_ AS sender,
			from_ AS token_in,
			to_ AS token_out,
			amount_in,
			amount_out
		FROM
			events_seawater_swap2
		WHERE created_by > after AND (from_ = filter OR to_ = filter)
		ORDER BY created_by DESC
		LIMIT limit_
	)
	UNION ALL
	(
		SELECT
			created_by,
			user_ AS sender,
			CASE
				WHEN zero_for_one THEN pool
				ELSE fusdcAddress
			END AS from,
			CASE
				WHEN zero_for_one THEN fusdcAddress
				ELSE pool
			END AS to,
			CASE
				WHEN zero_for_one THEN amount0
				ELSE amount1
			END AS amount_in,
			CASE
				WHEN zero_for_one THEN amount1
				ELSE amount0
			END AS amount_out
		FROM
			events_seawater_swap1
		WHERE created_by > after AND pool = filter
		ORDER BY created_by DESC
		LIMIT limit_
	)
) swaps
LEFT JOIN events_seawater_newpool fromPool
	ON swaps.token_in = fromPool.token
LEFT JOIN events_seawater_newpool toPool
	ON swaps.token_out = toPool.token;
$$;


--
-- Name: seawater_swaps_3_return; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_swaps_3_return (
    created_by timestamp without time zone NOT NULL,
    sender public.address NOT NULL,
    token_in public.address NOT NULL,
    token_out public.address NOT NULL,
    amount_in public.hugeint NOT NULL,
    amount_out public.hugeint NOT NULL,
    transaction_hash public.hash NOT NULL,
    token_out_decimals public.hugeint NOT NULL,
    token_in_decimals public.hugeint NOT NULL
);


--
-- Name: seawater_swaps_pool_2(public.address, public.hugeint, public.address, timestamp without time zone, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seawater_swaps_pool_2(fusdcaddress public.address, fusdcdecimals public.hugeint, filter public.address, after timestamp without time zone, limit_ integer) RETURNS SETOF public.seawater_swaps_3_return
    LANGUAGE sql STABLE
    AS $$
SELECT
	swaps.created_by,
	swaps.sender,
	swaps.token_in,
	swaps.token_out,
	swaps.amount_in,
	swaps.amount_out,
	swaps.transaction_hash,
	COALESCE(toPool.decimals, fusdcDecimals) AS token_out_decimals,
	COALESCE(fromPool.decimals, fusdcDecimals) AS token_in_decimals
FROM (
	(
		SELECT
			created_by,
			user_ AS sender,
			from_ AS token_in,
			to_ AS token_out,
			amount_in,
			amount_out,
			transaction_hash
		FROM
			events_seawater_swap2
		WHERE created_by > after AND (from_ = filter OR to_ = filter)
		ORDER BY created_by DESC
		LIMIT limit_
	)
	UNION ALL
	(
		SELECT
			created_by,
			user_ AS sender,
			CASE
				WHEN zero_for_one THEN pool
				ELSE fusdcAddress
			END AS from,
			CASE
				WHEN zero_for_one THEN fusdcAddress
				ELSE pool
			END AS to,
			CASE
				WHEN zero_for_one THEN amount0
				ELSE amount1
			END AS amount_in,
			CASE
				WHEN zero_for_one THEN amount1
				ELSE amount0
			END AS amount_out,
			transaction_hash
		FROM
			events_seawater_swap1
		WHERE created_by > after AND pool = filter
		ORDER BY created_by DESC
		LIMIT limit_
	)
) swaps
LEFT JOIN events_seawater_newpool fromPool
	ON swaps.token_in = fromPool.token
LEFT JOIN events_seawater_newpool toPool
	ON swaps.token_out = toPool.token;
$$;


--
-- Name: seawater_swaps_pool_3(public.address, public.hugeint, public.address, timestamp without time zone, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seawater_swaps_pool_3(fusdcaddress public.address, fusdcdecimals public.hugeint, filter public.address, after timestamp without time zone, limit_ integer) RETURNS SETOF public.seawater_swaps_3_return
    LANGUAGE sql STABLE
    AS $$
SELECT
	swaps.created_by,
	swaps.sender,
	swaps.token_in,
	swaps.token_out,
	swaps.amount_in,
	swaps.amount_out,
	swaps.transaction_hash,
	COALESCE(toPool.decimals, fusdcDecimals) AS token_out_decimals,
	COALESCE(fromPool.decimals, fusdcDecimals) AS token_in_decimals
FROM (
	(
		SELECT
			created_by,
			user_ AS sender,
			from_ AS token_in,
			to_ AS token_out,
			amount_in,
			amount_out,
			transaction_hash
		FROM
			events_seawater_swap2
		WHERE created_by > after AND (from_ = filter OR to_ = filter) AND (from_ = fusdcAddress OR to_ = fusdcAddress)
		ORDER BY created_by DESC
		LIMIT limit_
	)
	UNION ALL
	(
		SELECT
			created_by,
			user_ AS sender,
			CASE
				WHEN zero_for_one THEN pool
				ELSE fusdcAddress
			END AS from,
			CASE
				WHEN zero_for_one THEN fusdcAddress
				ELSE pool
			END AS to,
			CASE
				WHEN zero_for_one THEN amount0
				ELSE amount1
			END AS amount_in,
			CASE
				WHEN zero_for_one THEN amount1
				ELSE amount0
			END AS amount_out,
			transaction_hash
		FROM
			events_seawater_swap1
		WHERE created_by > after AND pool = filter
		ORDER BY created_by DESC
		LIMIT limit_
	)
) swaps
LEFT JOIN events_seawater_newpool fromPool
	ON swaps.token_in = fromPool.token
LEFT JOIN events_seawater_newpool toPool
	ON swaps.token_out = toPool.token;
$$;


--
-- Name: seawater_swaps_user_1(public.address, public.hugeint, public.address, timestamp without time zone, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seawater_swaps_user_1(fusdcaddress public.address, fusdcdecimals public.hugeint, owner public.address, after timestamp without time zone, limit_ integer) RETURNS SETOF public.seawater_swaps_2_return
    LANGUAGE sql STABLE
    AS $$
SELECT
	swaps.created_by,
	swaps.sender,
	swaps.token_in,
	swaps.token_out,
	swaps.amount_in,
	swaps.amount_out,
	COALESCE(toPool.decimals, fusdcDecimals) AS token_out_decimals,
	COALESCE(fromPool.decimals, fusdcDecimals) AS token_in_decimals
FROM (
	(
		SELECT
			created_by,
			user_ AS sender,
			from_ AS token_in,
			to_ AS token_out,
			amount_in,
			amount_out
		FROM
			events_seawater_swap2
		WHERE created_by > after AND user_ = owner
		ORDER BY created_by DESC
		LIMIT limit_
	)
	UNION ALL
	(
		SELECT
			created_by,
			user_ AS sender,
			CASE
				WHEN zero_for_one THEN pool
				ELSE fusdcAddress
			END AS from,
			CASE
				WHEN zero_for_one THEN fusdcAddress
				ELSE pool
			END AS to,
			CASE
				WHEN zero_for_one THEN amount0
				ELSE amount1
			END AS amount_in,
			CASE
				WHEN zero_for_one THEN amount1
				ELSE amount0
			END AS amount_out
		FROM
			events_seawater_swap1
		WHERE created_by > after AND user_ = owner
		ORDER BY created_by DESC
		LIMIT limit_
	)
) swaps
LEFT JOIN events_seawater_newpool fromPool
	ON swaps.token_in = fromPool.token
LEFT JOIN events_seawater_newpool toPool
	ON swaps.token_out = toPool.token;
$$;


--
-- Name: seawater_swaps_user_2(public.address, public.hugeint, public.address, timestamp without time zone, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seawater_swaps_user_2(fusdcaddress public.address, fusdcdecimals public.hugeint, owner public.address, after timestamp without time zone, limit_ integer) RETURNS SETOF public.seawater_swaps_3_return
    LANGUAGE sql STABLE
    AS $$
SELECT
	swaps.created_by,
	swaps.sender,
	swaps.token_in,
	swaps.token_out,
	swaps.amount_in,
	swaps.amount_out,
	swaps.transaction_hash,
	COALESCE(toPool.decimals, fusdcDecimals) AS token_out_decimals,
	COALESCE(fromPool.decimals, fusdcDecimals) AS token_in_decimals
FROM (
	(
		SELECT
			created_by,
			user_ AS sender,
			from_ AS token_in,
			to_ AS token_out,
			amount_in,
			amount_out,
			transaction_hash
		FROM
			events_seawater_swap2
		WHERE created_by > after AND user_ = owner
		ORDER BY created_by DESC
		LIMIT limit_
	)
	UNION ALL
	(
		SELECT
			created_by,
			user_ AS sender,
			CASE
				WHEN zero_for_one THEN pool
				ELSE fusdcAddress
			END AS from,
			CASE
				WHEN zero_for_one THEN fusdcAddress
				ELSE pool
			END AS to,
			CASE
				WHEN zero_for_one THEN amount0
				ELSE amount1
			END AS amount_in,
			CASE
				WHEN zero_for_one THEN amount1
				ELSE amount0
			END AS amount_out,
			transaction_hash
		FROM
			events_seawater_swap1
		WHERE created_by > after AND user_ = owner
		ORDER BY created_by DESC
		LIMIT limit_
	)
) swaps
LEFT JOIN events_seawater_newpool fromPool
	ON swaps.token_in = fromPool.token
LEFT JOIN events_seawater_newpool toPool
	ON swaps.token_out = toPool.token;
$$;


--
-- Name: seawater_swaps_user_3(public.address, public.hugeint, public.address, timestamp without time zone, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seawater_swaps_user_3(fusdcaddress public.address, fusdcdecimals public.hugeint, owner public.address, after timestamp without time zone, limit_ integer) RETURNS SETOF public.seawater_swaps_3_return
    LANGUAGE sql STABLE
    AS $$
SELECT
	swaps.created_by,
	swaps.sender,
	swaps.token_in,
	swaps.token_out,
	swaps.amount_in,
	swaps.amount_out,
	swaps.transaction_hash,
	COALESCE(toPool.decimals, fusdcDecimals) AS token_out_decimals,
	COALESCE(fromPool.decimals, fusdcDecimals) AS token_in_decimals
FROM (
	(
		SELECT
			created_by,
			user_ AS sender,
			from_ AS token_in,
			to_ AS token_out,
			amount_in,
			amount_out,
			transaction_hash
		FROM
			events_seawater_swap2
		WHERE created_by > after AND user_ = owner
		ORDER BY created_by DESC
		LIMIT limit_
	)
	UNION ALL
	(
		SELECT
			created_by,
			user_ AS sender,
			CASE
				WHEN zero_for_one THEN pool
				ELSE fusdcAddress
			END AS from,
			CASE
				WHEN zero_for_one THEN fusdcAddress
				ELSE pool
			END AS to,
			CASE
				WHEN zero_for_one THEN amount0
				ELSE amount1
			END AS amount_in,
			CASE
				WHEN zero_for_one THEN amount1
				ELSE amount0
			END AS amount_out,
			transaction_hash
		FROM
			events_seawater_swap1
		WHERE created_by > after AND user_ = owner
		ORDER BY created_by DESC
		LIMIT limit_
	)
) swaps
LEFT JOIN events_seawater_newpool fromPool
	ON swaps.token_in = fromPool.token
LEFT JOIN events_seawater_newpool toPool
	ON swaps.token_out = toPool.token;
$$;


--
-- Name: snapshot_create_positions_1(character varying[], public.hugeint[], public.hugeint[], public.hugeint[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_create_positions_1(pools character varying[], ids public.hugeint[], amount0s public.hugeint[], amount1s public.hugeint[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE affected_rows INT;
BEGIN
	DELETE FROM snapshot_positions_latest_1;
	FOR i IN 1..array_length(ids, 1) LOOP
		INSERT INTO snapshot_positions_latest_1 (
			updated_by,
			pos_id,
			owner,
			pool,
			lower,
			upper,
			amount0,
			amount1
		)
		SELECT
			CURRENT_TIMESTAMP,
			sw.pos_id,
			sw.owner,
			pool,
			sw.lower,
			sw.upper,
			amount0s[i],
			amount1s[i]
		FROM
			events_seawater_mintPosition sw
		WHERE
			sw.pos_id = ids[i] AND
			sw.pool = pools[i];

		INSERT INTO snapshot_positions_log_1 (
			created_by,
			pos_id,
			owner,
			pool,
			lower,
			upper,
			amount0,
			amount1
		)
		SELECT
			CURRENT_TIMESTAMP,
			sw.pos_id,
			sw.owner,
			pool,
			sw.lower,
			sw.upper,
			amount0s[i],
			amount1s[i]
		FROM
			events_seawater_mintPosition sw
		WHERE
			sw.pos_id = ids[i] AND
			sw.pool = pools[i];
	END LOOP;
END $$;


--
-- Name: snapshot_final_ticks_daily_1(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_final_ticks_daily_1() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM seawater_final_ticks_daily_2;
	INSERT INTO seawater_final_ticks_daily_2 SELECT * FROM seawater_final_ticks_daily_1;
END $$;


--
-- Name: snapshot_final_ticks_daily_3(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_final_ticks_daily_3() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM seawater_final_ticks_daily_3;
	INSERT INTO seawater_final_ticks_daily_3 SELECT * FROM seawater_final_ticks_daily_1;
END $$;


--
-- Name: snapshot_final_ticks_monthly_2(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_final_ticks_monthly_2() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM seawater_final_ticks_monthly_2;
	INSERT INTO seawater_final_ticks_daily_2 SELECT * FROM seawater_final_ticks_monthly_1;
END $$;


--
-- Name: snapshot_final_ticks_monthly_3(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_final_ticks_monthly_3() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM seawater_final_ticks_monthly_3;
	INSERT INTO seawater_final_ticks_monthly_3 SELECT * FROM seawater_final_ticks_monthly_1;
END $$;


--
-- Name: snapshot_latest_ticks_1(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_latest_ticks_1() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM seawater_latest_ticks_2;
	INSERT INTO seawater_latest_ticks_2 SELECT * FROM seawater_latest_ticks_1;
END $$;


--
-- Name: snapshot_liquidity_groups_1(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_liquidity_groups_1() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM seawater_liquidity_groups_2;
	INSERT INTO seawater_liquidity_groups_2 SELECT * FROM seawater_liquidity_groups_1;
END $$;


--
-- Name: snapshot_positions_latest_decimals_grouped_user_1_return; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.snapshot_positions_latest_decimals_grouped_user_1_return (
    pool public.address NOT NULL,
    decimals public.hugeint NOT NULL,
    cumulative_amount0 public.hugeint NOT NULL,
    cumulative_amount1 public.hugeint NOT NULL
);


--
-- Name: snapshot_positions_latest_decimals_grouped_user_1(public.address); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_positions_latest_decimals_grouped_user_1(wallet public.address) RETURNS SETOF public.snapshot_positions_latest_decimals_grouped_user_1_return
    LANGUAGE sql STABLE
    AS $$
SELECT
	pool,
	decimals,
	SUM(amount0) AS cumulative_amount0,
	SUM(amount1) AS cumulative_amount1
FROM
	snapshot_positions_latest_decimals_1
WHERE owner = wallet
GROUP BY
	pool,
	decimals;
$$;


--
-- Name: snapshot_seawater_active_positions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.snapshot_seawater_active_positions() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
	DELETE FROM seawater_active_positions_2;
	INSERT INTO seawater_active_positions_2 SELECT * FROM seawater_active_positions_1;
END $$;


--
-- Name: swaps_decimals_group_1_return; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.swaps_decimals_group_1_return (
    pool public.address NOT NULL,
    decimals public.hugeint NOT NULL,
    cumulative_amount0 public.hugeint NOT NULL,
    cumulative_amount1 public.hugeint NOT NULL
);


--
-- Name: swaps_decimals_pool_group_1(public.address, public.hugeint, public.address); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.swaps_decimals_pool_group_1(fusdcaddress public.address, fusdcdecimals public.hugeint, pooladdress public.address) RETURNS SETOF public.swaps_decimals_group_1_return
    LANGUAGE sql STABLE
    AS $$
WITH swap_data AS (
	SELECT *
	FROM seawater_swaps_1(fusdcAddress, fusdcDecimals)
	WHERE
		token_in = poolAddress
		OR token_out = poolAddress
		OR token_in = fusdcAddress
		OR token_out = fusdcAddress
)
SELECT
	CASE
		WHEN token_in != fusdcAddress THEN token_in
		ELSE token_out
	END AS pool,
	CASE
		WHEN token_in != fusdcAddress THEN token_in_decimals
		ELSE token_out_decimals
	END AS decimals,
	SUM(CASE
		WHEN token_in = fusdcAddress THEN amount_in
		ELSE amount_out
	END) AS cumulative_amount0,
	SUM(CASE
		WHEN token_in != fusdcAddress THEN amount_in
		ELSE amount_out
	END) AS cumulative_amount1
FROM swap_data
GROUP BY
	CASE
		WHEN token_in != fusdcAddress THEN token_in
		ELSE token_out
	END,
	CASE
		WHEN token_in != fusdcAddress THEN token_in_decimals
		ELSE token_out_decimals
	END;
$$;


--
-- Name: swaps_decimals_user_group_1(public.address, public.hugeint, public.address); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.swaps_decimals_user_group_1(fusdcaddress public.address, fusdcdecimals public.hugeint, walletaddress public.address) RETURNS SETOF public.swaps_decimals_group_1_return
    LANGUAGE sql STABLE
    AS $$
WITH swap_data AS (
	SELECT *
	FROM seawater_swaps_1(fusdcAddress, fusdcDecimals)
	WHERE sender = walletAddress
)
SELECT
	CASE
		WHEN token_in != fusdcAddress THEN token_in
		ELSE token_out
	END AS pool,
	CASE
		WHEN token_in != fusdcAddress THEN token_in_decimals
		ELSE token_out_decimals
	END AS decimals,
	SUM(CASE
		WHEN token_in = fusdcAddress THEN amount_in
		ELSE amount_out
	END) AS cumulative_amount0,
	SUM(CASE
		WHEN token_in != fusdcAddress THEN amount_in
		ELSE amount_out
	END) AS cumulative_amount1
FROM swap_data
GROUP BY
	CASE
		WHEN token_in != fusdcAddress THEN token_in
		ELSE token_out
	END,
	CASE
		WHEN token_in != fusdcAddress THEN token_in_decimals
		ELSE token_out_decimals
	END;
$$;


--
-- Name: events_seawater_newpool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_newpool (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    token public.address NOT NULL,
    fee integer NOT NULL,
    decimals public.hugeint NOT NULL,
    tick_spacing integer NOT NULL
);


--
-- Name: events_seawater_swap1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_swap1 (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    user_ public.address NOT NULL,
    pool public.address NOT NULL,
    zero_for_one boolean NOT NULL,
    amount0 public.hugeint NOT NULL,
    amount1 public.hugeint NOT NULL,
    final_tick bigint NOT NULL
);


--
-- Name: _direct_view_37; Type: VIEW; Schema: _timescaledb_internal; Owner: -
--

CREATE VIEW _timescaledb_internal._direct_view_37 AS
 SELECT public.time_bucket('01:00:00'::interval, events_seawater_swap1.created_by) AS hourly_interval,
    events_seawater_swap1.pool,
    (((1.0001 ^ avg(events_seawater_swap1.final_tick)) * (1000000)::numeric) / ((10)::numeric ^ (events_seawater_newpool.decimals)::numeric)) AS price,
    events_seawater_newpool.decimals
   FROM (public.events_seawater_swap1
     JOIN public.events_seawater_newpool ON (((events_seawater_newpool.token)::bpchar = (events_seawater_swap1.pool)::bpchar)))
  GROUP BY events_seawater_swap1.pool, (public.time_bucket('01:00:00'::interval, events_seawater_swap1.created_by)), events_seawater_newpool.decimals;


--
-- Name: events_seawater_swap2; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_swap2 (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    user_ public.address NOT NULL,
    from_ public.address NOT NULL,
    to_ public.address NOT NULL,
    amount_in public.hugeint NOT NULL,
    amount_out public.hugeint NOT NULL,
    fluid_volume public.hugeint NOT NULL,
    final_tick0 bigint NOT NULL,
    final_tick1 bigint NOT NULL
);


--
-- Name: _hyper_34_30_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_30_chunk (
    CONSTRAINT constraint_30 CHECK (((created_by >= '2024-08-08 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-08-15 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_31_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_31_chunk (
    CONSTRAINT constraint_31 CHECK (((created_by >= '2024-08-15 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-08-22 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_67_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_67_chunk (
    CONSTRAINT constraint_67 CHECK (((created_by >= '2024-08-22 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-08-29 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_68_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_68_chunk (
    CONSTRAINT constraint_68 CHECK (((created_by >= '2024-08-29 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-09-05 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_70_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_70_chunk (
    CONSTRAINT constraint_70 CHECK (((created_by >= '2024-09-05 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-09-12 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_73_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_73_chunk (
    CONSTRAINT constraint_73 CHECK (((created_by >= '2024-09-12 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-09-19 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_75_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_75_chunk (
    CONSTRAINT constraint_75 CHECK (((created_by >= '2024-09-19 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-09-26 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_77_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_77_chunk (
    CONSTRAINT constraint_77 CHECK (((created_by >= '2024-09-26 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-10-03 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_79_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_79_chunk (
    CONSTRAINT constraint_79 CHECK (((created_by >= '2024-10-03 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-10-10 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_34_81_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_34_81_chunk (
    CONSTRAINT constraint_81 CHECK (((created_by >= '2024-10-10 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-10-17 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap2);


--
-- Name: _hyper_35_26_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_26_chunk (
    CONSTRAINT constraint_26 CHECK (((created_by >= '2024-07-25 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-08-01 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_28_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_28_chunk (
    CONSTRAINT constraint_28 CHECK (((created_by >= '2024-08-01 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-08-08 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_29_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_29_chunk (
    CONSTRAINT constraint_29 CHECK (((created_by >= '2024-08-08 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-08-15 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_32_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_32_chunk (
    CONSTRAINT constraint_32 CHECK (((created_by >= '2024-08-15 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-08-22 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_66_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_66_chunk (
    CONSTRAINT constraint_66 CHECK (((created_by >= '2024-08-22 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-08-29 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_69_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_69_chunk (
    CONSTRAINT constraint_69 CHECK (((created_by >= '2024-08-29 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-09-05 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_71_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_71_chunk (
    CONSTRAINT constraint_71 CHECK (((created_by >= '2024-09-05 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-09-12 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_72_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_72_chunk (
    CONSTRAINT constraint_72 CHECK (((created_by >= '2024-09-12 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-09-19 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_74_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_74_chunk (
    CONSTRAINT constraint_74 CHECK (((created_by >= '2024-09-19 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-09-26 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_76_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_76_chunk (
    CONSTRAINT constraint_76 CHECK (((created_by >= '2024-09-26 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-10-03 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_78_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_78_chunk (
    CONSTRAINT constraint_78 CHECK (((created_by >= '2024-10-03 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-10-10 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _hyper_35_80_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_35_80_chunk (
    CONSTRAINT constraint_80 CHECK (((created_by >= '2024-10-10 00:00:00+00'::timestamp with time zone) AND (created_by < '2024-10-17 00:00:00+00'::timestamp with time zone)))
)
INHERITS (public.events_seawater_swap1);


--
-- Name: _materialized_hypertable_37; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._materialized_hypertable_37 (
    hourly_interval timestamp with time zone NOT NULL,
    pool public.address,
    price numeric,
    decimals public.hugeint
);


--
-- Name: _hyper_37_27_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_37_27_chunk (
    CONSTRAINT constraint_27 CHECK (((hourly_interval >= '2024-06-06 00:00:00+00'::timestamp with time zone) AND (hourly_interval < '2024-08-15 00:00:00+00'::timestamp with time zone)))
)
INHERITS (_timescaledb_internal._materialized_hypertable_37);


--
-- Name: _hyper_37_33_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_37_33_chunk (
    CONSTRAINT constraint_33 CHECK (((hourly_interval >= '2024-08-15 00:00:00+00'::timestamp with time zone) AND (hourly_interval < '2024-10-24 00:00:00+00'::timestamp with time zone)))
)
INHERITS (_timescaledb_internal._materialized_hypertable_37);


--
-- Name: _partial_view_37; Type: VIEW; Schema: _timescaledb_internal; Owner: -
--

CREATE VIEW _timescaledb_internal._partial_view_37 AS
 SELECT public.time_bucket('01:00:00'::interval, events_seawater_swap1.created_by) AS hourly_interval,
    events_seawater_swap1.pool,
    (((1.0001 ^ avg(events_seawater_swap1.final_tick)) * (1000000)::numeric) / ((10)::numeric ^ (events_seawater_newpool.decimals)::numeric)) AS price,
    events_seawater_newpool.decimals
   FROM (public.events_seawater_swap1
     JOIN public.events_seawater_newpool ON (((events_seawater_newpool.token)::bpchar = (events_seawater_swap1.pool)::bpchar)))
  GROUP BY events_seawater_swap1.pool, (public.time_bucket('01:00:00'::interval, events_seawater_swap1.created_by)), events_seawater_newpool.decimals;


--
-- Name: erc20_cache_1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.erc20_cache_1 (
    id integer NOT NULL,
    address public.address NOT NULL,
    name character varying NOT NULL,
    symbol character varying NOT NULL,
    total_supply public.hugeint NOT NULL,
    decimals integer NOT NULL
);


--
-- Name: erc20_cache_1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.erc20_cache_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: erc20_cache_1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.erc20_cache_1_id_seq OWNED BY public.erc20_cache_1.id;


--
-- Name: events_erc20_transfer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_erc20_transfer (
    id integer NOT NULL,
    created_by timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    sender public.address NOT NULL,
    recipient public.address NOT NULL,
    value public.hugeint NOT NULL
);


--
-- Name: events_erc20_transfer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_erc20_transfer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_erc20_transfer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_erc20_transfer_id_seq OWNED BY public.events_erc20_transfer.id;


--
-- Name: events_leo_campaignbalanceupdated; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_leo_campaignbalanceupdated (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    identifier character varying NOT NULL,
    new_maximum public.hugeint NOT NULL
);


--
-- Name: events_leo_campaignbalanceupdated_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_leo_campaignbalanceupdated_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_leo_campaignbalanceupdated_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_leo_campaignbalanceupdated_id_seq OWNED BY public.events_leo_campaignbalanceupdated.id;


--
-- Name: events_leo_campaigncreated; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_leo_campaigncreated (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    identifier character varying NOT NULL,
    pool public.address NOT NULL,
    token public.address NOT NULL,
    tick_lower integer NOT NULL,
    tick_upper integer NOT NULL,
    owner public.address NOT NULL,
    starting timestamp without time zone,
    ending timestamp without time zone,
    per_second bigint NOT NULL
);


--
-- Name: events_leo_campaigncreated_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_leo_campaigncreated_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_leo_campaigncreated_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_leo_campaigncreated_id_seq OWNED BY public.events_leo_campaigncreated.id;


--
-- Name: events_leo_campaignupdated; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_leo_campaignupdated (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    identifier character varying NOT NULL,
    pool public.address NOT NULL,
    per_second public.hugeint NOT NULL,
    tick_lower integer NOT NULL,
    tick_upper integer NOT NULL,
    starting timestamp without time zone,
    ending timestamp without time zone
);


--
-- Name: events_leo_campaignupdated_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_leo_campaignupdated_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_leo_campaignupdated_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_leo_campaignupdated_id_seq OWNED BY public.events_leo_campaignupdated.id;


--
-- Name: events_leo_positiondivested; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_leo_positiondivested (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    position_id public.hugeint NOT NULL
);


--
-- Name: events_leo_positiondivested_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_leo_positiondivested_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_leo_positiondivested_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_leo_positiondivested_id_seq OWNED BY public.events_leo_positiondivested.id;


--
-- Name: events_leo_positionvested; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_leo_positionvested (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    position_id public.hugeint NOT NULL
);


--
-- Name: events_leo_positionvested_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_leo_positionvested_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_leo_positionvested_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_leo_positionvested_id_seq OWNED BY public.events_leo_positionvested.id;


--
-- Name: events_seawater_burnposition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_burnposition (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    pos_id public.hugeint NOT NULL,
    owner public.address NOT NULL
);


--
-- Name: events_seawater_burnposition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_burnposition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_burnposition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_burnposition_id_seq OWNED BY public.events_seawater_burnposition.id;


--
-- Name: events_seawater_collectfees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_collectfees (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    pos_id public.hugeint NOT NULL,
    pool public.address NOT NULL,
    to_ public.address NOT NULL,
    amount0 public.hugeint NOT NULL,
    amount1 public.hugeint NOT NULL
);


--
-- Name: events_seawater_collectfees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_collectfees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_collectfees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_collectfees_id_seq OWNED BY public.events_seawater_collectfees.id;


--
-- Name: events_seawater_collectprotocolfees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_collectprotocolfees (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    pool public.address NOT NULL,
    to_ public.address NOT NULL,
    amount0 public.hugeint NOT NULL,
    amount1 public.hugeint NOT NULL
);


--
-- Name: events_seawater_collectprotocolfees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_collectprotocolfees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_collectprotocolfees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_collectprotocolfees_id_seq OWNED BY public.events_seawater_collectprotocolfees.id;


--
-- Name: events_seawater_mintposition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_mintposition (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    pos_id public.hugeint NOT NULL,
    owner public.address NOT NULL,
    pool public.address NOT NULL,
    lower bigint NOT NULL,
    upper bigint NOT NULL
);


--
-- Name: events_seawater_mintposition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_mintposition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_mintposition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_mintposition_id_seq OWNED BY public.events_seawater_mintposition.id;


--
-- Name: events_seawater_newpool_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_newpool_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_newpool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_newpool_id_seq OWNED BY public.events_seawater_newpool.id;


--
-- Name: events_seawater_swap1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_swap1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_swap1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_swap1_id_seq OWNED BY public.events_seawater_swap1.id;


--
-- Name: events_seawater_swap2_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_swap2_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_swap2_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_swap2_id_seq OWNED BY public.events_seawater_swap2.id;


--
-- Name: events_seawater_transferposition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_transferposition (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    from_ public.address NOT NULL,
    to_ public.address NOT NULL,
    pos_id public.hugeint NOT NULL
);


--
-- Name: events_seawater_transferposition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_transferposition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_transferposition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_transferposition_id_seq OWNED BY public.events_seawater_transferposition.id;


--
-- Name: events_seawater_updatepositionliquidity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_seawater_updatepositionliquidity (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    pos_id public.hugeint NOT NULL,
    token0 public.hugeint NOT NULL,
    token1 public.hugeint NOT NULL
);


--
-- Name: events_seawater_updatepositionliquidity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_seawater_updatepositionliquidity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_seawater_updatepositionliquidity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_seawater_updatepositionliquidity_id_seq OWNED BY public.events_seawater_updatepositionliquidity.id;


--
-- Name: events_thirdweb_accountcreated; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_thirdweb_accountcreated (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    block_number integer NOT NULL,
    emitter_addr public.address NOT NULL,
    account public.address NOT NULL,
    account_admin public.address NOT NULL
);


--
-- Name: events_thirdweb_accountcreated_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_thirdweb_accountcreated_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_thirdweb_accountcreated_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_thirdweb_accountcreated_id_seq OWNED BY public.events_thirdweb_accountcreated.id;


--
-- Name: faucet_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faucet_requests (
    id integer NOT NULL,
    addr public.address NOT NULL,
    ip_addr character varying NOT NULL,
    created_by timestamp without time zone NOT NULL,
    updated_by timestamp without time zone NOT NULL,
    was_sent boolean DEFAULT false NOT NULL,
    is_fly_staker boolean DEFAULT false NOT NULL
);


--
-- Name: faucet_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faucet_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faucet_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faucet_requests_id_seq OWNED BY public.faucet_requests.id;


--
-- Name: ingestor_checkpointing_1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingestor_checkpointing_1 (
    id integer NOT NULL,
    last_updated timestamp without time zone NOT NULL,
    block_number integer NOT NULL
);


--
-- Name: ingestor_checkpointing_1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingestor_checkpointing_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingestor_checkpointing_1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingestor_checkpointing_1_id_seq OWNED BY public.ingestor_checkpointing_1.id;


--
-- Name: leo_campaigns_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.leo_campaigns_1 AS
 SELECT events_leo_campaigncreated.pool,
    events_leo_campaigncreated.token,
    COALESCE(updated.tick_lower, events_leo_campaigncreated.tick_lower) AS tick_lower,
    COALESCE(updated.tick_upper, events_leo_campaigncreated.tick_upper) AS tick_upper,
    events_leo_campaigncreated.owner,
    COALESCE(updated.starting, events_leo_campaigncreated.starting) AS starting,
    COALESCE(updated.ending, events_leo_campaigncreated.ending) AS ending,
    events_leo_campaigncreated.identifier,
    COALESCE((balanceupdated.new_maximum)::numeric, (0)::numeric) AS maximum_amount,
    COALESCE((updated.per_second)::numeric, (events_leo_campaigncreated.per_second)::numeric) AS per_second
   FROM ((public.events_leo_campaigncreated
     LEFT JOIN ( SELECT DISTINCT ON (events_leo_campaignbalanceupdated.identifier) events_leo_campaignbalanceupdated.identifier,
            events_leo_campaignbalanceupdated.new_maximum
           FROM public.events_leo_campaignbalanceupdated
          ORDER BY events_leo_campaignbalanceupdated.identifier, events_leo_campaignbalanceupdated.created_by DESC) balanceupdated ON (((events_leo_campaigncreated.identifier)::text = (balanceupdated.identifier)::text)))
     LEFT JOIN ( SELECT DISTINCT ON (events_leo_campaignupdated.identifier) events_leo_campaignupdated.identifier,
            events_leo_campaignupdated.tick_lower,
            events_leo_campaignupdated.tick_upper,
            events_leo_campaignupdated.starting,
            events_leo_campaignupdated.ending,
            events_leo_campaignupdated.per_second
           FROM public.events_leo_campaignupdated
          ORDER BY events_leo_campaignupdated.identifier, events_leo_campaignupdated.created_by DESC) updated ON (((events_leo_campaigncreated.identifier)::text = (updated.identifier)::text)));


--
-- Name: leo_active_campaigns_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.leo_active_campaigns_1 AS
 SELECT leo_campaigns_1.pool,
    leo_campaigns_1.token,
    leo_campaigns_1.tick_lower,
    leo_campaigns_1.tick_upper,
    leo_campaigns_1.owner,
    leo_campaigns_1.starting,
    leo_campaigns_1.ending,
    leo_campaigns_1.identifier,
    leo_campaigns_1.maximum_amount,
    leo_campaigns_1.per_second
   FROM public.leo_campaigns_1
  WHERE ((leo_campaigns_1.starting <= now()) AND (leo_campaigns_1.ending >= now()));


--
-- Name: leo_upcoming_campaigns_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.leo_upcoming_campaigns_1 AS
 SELECT leo_campaigns_1.pool,
    leo_campaigns_1.token,
    leo_campaigns_1.tick_lower,
    leo_campaigns_1.tick_upper,
    leo_campaigns_1.owner,
    leo_campaigns_1.starting,
    leo_campaigns_1.ending,
    leo_campaigns_1.identifier,
    leo_campaigns_1.maximum_amount,
    leo_campaigns_1.per_second
   FROM public.leo_campaigns_1
  WHERE (leo_campaigns_1.starting > now());


--
-- Name: ninelives_campaigns_1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ninelives_campaigns_1 (
    id text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    content jsonb NOT NULL
);


--
-- Name: ninelives_frontpage_1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ninelives_frontpage_1 (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    until timestamp without time zone NOT NULL,
    campaign_id text NOT NULL
);


--
-- Name: ninelives_frontpage_1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ninelives_frontpage_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ninelives_frontpage_1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ninelives_frontpage_1_id_seq OWNED BY public.ninelives_frontpage_1.id;


--
-- Name: ninelives_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ninelives_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: notes_1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes_1 (
    id integer NOT NULL,
    created_by timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    content character varying NOT NULL,
    placement character varying NOT NULL,
    from_ timestamp without time zone NOT NULL,
    to_ timestamp without time zone NOT NULL,
    target public.address
);


--
-- Name: notes_1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notes_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notes_1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notes_1_id_seq OWNED BY public.notes_1.id;


--
-- Name: notes_current_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.notes_current_1 AS
 SELECT notes_1.id,
    notes_1.created_by,
    notes_1.content,
    notes_1.placement,
    notes_1.from_,
    notes_1.to_,
    notes_1.target
   FROM public.notes_1
  WHERE ((notes_1.from_ < CURRENT_TIMESTAMP) AND (notes_1.to_ > CURRENT_TIMESTAMP));


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: seawater_positions_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_positions_1 AS
 SELECT events_seawater_mintposition.created_by,
    events_seawater_mintposition.block_hash,
    events_seawater_mintposition.transaction_hash,
    events_seawater_mintposition.block_number AS created_block_number,
    events_seawater_mintposition.pos_id,
    COALESCE(transfers.to_, events_seawater_mintposition.owner) AS owner,
    events_seawater_mintposition.pool,
    events_seawater_mintposition.lower,
    events_seawater_mintposition.upper
   FROM (public.events_seawater_mintposition
     LEFT JOIN public.events_seawater_transferposition transfers ON (((transfers.pos_id)::numeric = (events_seawater_mintposition.pos_id)::numeric)));


--
-- Name: seawater_active_positions_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_active_positions_1 AS
 SELECT seawater_positions_1.created_by,
    seawater_positions_1.block_hash,
    seawater_positions_1.transaction_hash,
    seawater_positions_1.created_block_number,
    seawater_positions_1.pos_id,
    seawater_positions_1.owner,
    seawater_positions_1.pool,
    seawater_positions_1.lower,
    seawater_positions_1.upper
   FROM public.seawater_positions_1
  WHERE (NOT ((seawater_positions_1.pos_id)::numeric IN ( SELECT events_seawater_burnposition.pos_id
           FROM public.events_seawater_burnposition)));


--
-- Name: seawater_active_positions_2; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_active_positions_2 (
    created_by timestamp without time zone NOT NULL,
    block_hash public.hash NOT NULL,
    transaction_hash public.hash NOT NULL,
    created_block_number integer NOT NULL,
    pos_id public.hugeint NOT NULL,
    owner public.address NOT NULL,
    pool public.address NOT NULL,
    lower bigint NOT NULL,
    upper bigint NOT NULL
);


--
-- Name: seawater_positions_vested; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_positions_vested AS
 SELECT DISTINCT ON (a.position_id) a.is_vested,
    a.position_id,
    a.created_by
   FROM ( SELECT true AS is_vested,
            events_leo_positionvested.position_id,
            events_leo_positionvested.created_by
           FROM public.events_leo_positionvested
        UNION
         SELECT false AS is_vested,
            events_leo_positiondivested.position_id,
            events_leo_positiondivested.created_by
           FROM public.events_leo_positiondivested
  ORDER BY 3 DESC) a;


--
-- Name: seawater_active_positions_3; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_active_positions_3 AS
 SELECT seawater_active_positions_2.created_by,
    seawater_active_positions_2.block_hash,
    seawater_active_positions_2.transaction_hash,
    seawater_active_positions_2.created_block_number,
    seawater_active_positions_2.pos_id,
    seawater_active_positions_2.owner,
    seawater_active_positions_2.pool,
    seawater_active_positions_2.lower,
    seawater_active_positions_2.upper,
    COALESCE(seawater_positions_vested.is_vested, false) AS is_vested
   FROM (public.seawater_active_positions_2
     LEFT JOIN public.seawater_positions_vested ON (((seawater_active_positions_2.pos_id)::numeric = (seawater_positions_vested.position_id)::numeric)));


--
-- Name: seawater_final_ticks_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_final_ticks_1 AS
 SELECT swaps.final_tick,
    swaps.created_by,
    swaps.pool
   FROM ( SELECT events_seawater_swap1.final_tick,
            events_seawater_swap1.created_by,
            events_seawater_swap1.pool
           FROM public.events_seawater_swap1
        UNION ALL
         SELECT events_seawater_swap2.final_tick0 AS final_tick,
            events_seawater_swap2.created_by,
            events_seawater_swap2.from_ AS pool
           FROM public.events_seawater_swap2
        UNION ALL
         SELECT events_seawater_swap2.final_tick1 AS final_tick,
            events_seawater_swap2.created_by,
            events_seawater_swap2.to_ AS pool
           FROM public.events_seawater_swap2) swaps
  ORDER BY swaps.created_by DESC;


--
-- Name: seawater_final_ticks_daily_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_final_ticks_daily_1 AS
 SELECT public.last(seawater_final_ticks_1.final_tick, seawater_final_ticks_1.created_by) AS final_tick,
    seawater_final_ticks_1.pool,
    public.time_bucket('1 day'::interval, seawater_final_ticks_1.created_by) AS day
   FROM public.seawater_final_ticks_1
  GROUP BY seawater_final_ticks_1.pool, (public.time_bucket('1 day'::interval, seawater_final_ticks_1.created_by))
  ORDER BY (public.time_bucket('1 day'::interval, seawater_final_ticks_1.created_by)) DESC;


--
-- Name: seawater_final_ticks_daily_2; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_final_ticks_daily_2 (
    final_tick bigint NOT NULL,
    pool public.address NOT NULL,
    day timestamp without time zone
);


--
-- Name: seawater_final_ticks_daily_3; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_final_ticks_daily_3 (
    final_tick bigint NOT NULL,
    pool public.address NOT NULL,
    day timestamp without time zone
);


--
-- Name: seawater_final_ticks_decimals_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_final_ticks_decimals_1 AS
 WITH latest_swaps AS (
         SELECT swaps.final_tick,
            swaps.created_by,
            swaps.pool,
            row_number() OVER (PARTITION BY swaps.pool ORDER BY swaps.created_by DESC) AS rn
           FROM ( SELECT events_seawater_swap1.final_tick,
                    events_seawater_swap1.created_by,
                    events_seawater_swap1.pool
                   FROM public.events_seawater_swap1
                UNION ALL
                 SELECT events_seawater_swap2.final_tick0 AS final_tick,
                    events_seawater_swap2.created_by,
                    events_seawater_swap2.from_ AS pool
                   FROM public.events_seawater_swap2
                UNION ALL
                 SELECT events_seawater_swap2.final_tick1 AS final_tick,
                    events_seawater_swap2.created_by,
                    events_seawater_swap2.to_ AS pool
                   FROM public.events_seawater_swap2) swaps
        )
 SELECT ls.final_tick,
    ls.created_by,
    ls.pool,
    ep.decimals
   FROM (latest_swaps ls
     LEFT JOIN public.events_seawater_newpool ep ON (((ls.pool)::bpchar = (ep.token)::bpchar)))
  WHERE (ls.rn = 1)
  ORDER BY ls.created_by DESC;


--
-- Name: seawater_final_ticks_monthly_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_final_ticks_monthly_1 AS
 SELECT public.last(seawater_final_ticks_1.final_tick, seawater_final_ticks_1.created_by) AS final_tick,
    seawater_final_ticks_1.pool,
    public.time_bucket('1 mon'::interval, seawater_final_ticks_1.created_by) AS month
   FROM public.seawater_final_ticks_1
  GROUP BY seawater_final_ticks_1.pool, (public.time_bucket('1 mon'::interval, seawater_final_ticks_1.created_by))
  ORDER BY (public.time_bucket('1 mon'::interval, seawater_final_ticks_1.created_by)) DESC;


--
-- Name: seawater_final_ticks_monthly_2; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_final_ticks_monthly_2 (
    final_tick bigint NOT NULL,
    pool public.address NOT NULL,
    month timestamp without time zone
);


--
-- Name: seawater_final_ticks_monthly_3; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_final_ticks_monthly_3 (
    final_tick bigint NOT NULL,
    pool public.address NOT NULL,
    month timestamp without time zone
);


--
-- Name: seawater_latest_ticks_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_latest_ticks_1 AS
 SELECT swaps.final_tick,
    swaps.created_by,
    swaps.pool
   FROM ( SELECT subquery1.final_tick,
            subquery1.created_by,
            subquery1.pool
           FROM ( SELECT events_seawater_swap1.final_tick,
                    events_seawater_swap1.created_by,
                    events_seawater_swap1.pool,
                    row_number() OVER (PARTITION BY events_seawater_swap1.pool ORDER BY events_seawater_swap1.created_by DESC) AS rn
                   FROM public.events_seawater_swap1) subquery1
          WHERE (subquery1.rn = 1)
        UNION ALL
         SELECT subquery2.final_tick0 AS final_tick,
            subquery2.created_by,
            subquery2.from_ AS pool
           FROM ( SELECT events_seawater_swap2.final_tick0,
                    events_seawater_swap2.created_by,
                    events_seawater_swap2.from_,
                    row_number() OVER (PARTITION BY events_seawater_swap2.from_ ORDER BY events_seawater_swap2.created_by DESC) AS rn
                   FROM public.events_seawater_swap2) subquery2
          WHERE (subquery2.rn = 1)
        UNION ALL
         SELECT subquery3.final_tick1 AS final_tick,
            subquery3.created_by,
            subquery3.to_ AS pool
           FROM ( SELECT events_seawater_swap2.final_tick1,
                    events_seawater_swap2.created_by,
                    events_seawater_swap2.to_,
                    row_number() OVER (PARTITION BY events_seawater_swap2.to_ ORDER BY events_seawater_swap2.created_by DESC) AS rn
                   FROM public.events_seawater_swap2) subquery3
          WHERE (subquery3.rn = 1)) swaps
  ORDER BY swaps.created_by DESC;


--
-- Name: seawater_latest_ticks_2; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_latest_ticks_2 (
    final_tick bigint NOT NULL,
    created_by timestamp without time zone NOT NULL,
    pool public.address NOT NULL
);


--
-- Name: snapshot_positions_latest_1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.snapshot_positions_latest_1 (
    id integer NOT NULL,
    updated_by timestamp without time zone NOT NULL,
    pos_id public.hugeint NOT NULL,
    owner public.address NOT NULL,
    pool public.address NOT NULL,
    lower bigint NOT NULL,
    upper bigint NOT NULL,
    amount0 public.hugeint NOT NULL,
    amount1 public.hugeint NOT NULL
);


--
-- Name: seawater_liquidity_groups_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_liquidity_groups_1 AS
 WITH tick_ranges AS (
         SELECT generate_series('-887272'::integer, 887272, 10000) AS tick
        ), position_ticks AS (
         SELECT tr.tick,
            (tr.tick + 10000) AS next_tick,
            spl.pos_id,
            spl.owner,
            spl.pool,
            spl.lower,
            spl.upper,
            spl.amount0,
            spl.amount1
           FROM (tick_ranges tr
             LEFT JOIN public.snapshot_positions_latest_1 spl ON (((tr.tick <= spl.upper) AND ((tr.tick + 10000) > spl.lower))))
        ), cumulative_amounts AS (
         SELECT position_ticks.pool,
            position_ticks.tick,
            position_ticks.next_tick,
            sum((position_ticks.amount0)::numeric) AS cumulative_amount0,
            sum((position_ticks.amount1)::numeric) AS cumulative_amount1
           FROM position_ticks
          GROUP BY position_ticks.pool, position_ticks.tick, position_ticks.next_tick
        )
 SELECT cumulative_amounts.pool,
    np.decimals,
    cumulative_amounts.tick,
    cumulative_amounts.next_tick,
    cumulative_amounts.cumulative_amount0,
    cumulative_amounts.cumulative_amount1
   FROM (cumulative_amounts
     LEFT JOIN public.events_seawater_newpool np ON (((np.token)::bpchar = (cumulative_amounts.pool)::bpchar)))
  WHERE ((cumulative_amounts.cumulative_amount0 > (0)::numeric) OR (cumulative_amounts.cumulative_amount1 > (0)::numeric))
  ORDER BY cumulative_amounts.tick;


--
-- Name: seawater_liquidity_groups_2; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seawater_liquidity_groups_2 (
    pool public.address NOT NULL,
    decimals public.hugeint NOT NULL,
    tick integer NOT NULL,
    next_tick integer NOT NULL,
    cumulative_amount0 numeric NOT NULL,
    cumulative_amount1 numeric NOT NULL
);


--
-- Name: seawater_pool_swap1_price_hourly_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_pool_swap1_price_hourly_1 AS
 SELECT _materialized_hypertable_37.hourly_interval,
    _materialized_hypertable_37.pool,
    _materialized_hypertable_37.price,
    _materialized_hypertable_37.decimals
   FROM _timescaledb_internal._materialized_hypertable_37 _materialized_hypertable_37
  WHERE (_materialized_hypertable_37.hourly_interval < COALESCE(_timescaledb_functions.to_timestamp(_timescaledb_functions.cagg_watermark(37)), '-infinity'::timestamp with time zone))
UNION ALL
 SELECT public.time_bucket('01:00:00'::interval, events_seawater_swap1.created_by) AS hourly_interval,
    events_seawater_swap1.pool,
    (((1.0001 ^ avg(events_seawater_swap1.final_tick)) * (1000000)::numeric) / ((10)::numeric ^ (events_seawater_newpool.decimals)::numeric)) AS price,
    events_seawater_newpool.decimals
   FROM (public.events_seawater_swap1
     JOIN public.events_seawater_newpool ON (((events_seawater_newpool.token)::bpchar = (events_seawater_swap1.pool)::bpchar)))
  WHERE (events_seawater_swap1.created_by >= COALESCE(_timescaledb_functions.to_timestamp(_timescaledb_functions.cagg_watermark(37)), '-infinity'::timestamp with time zone))
  GROUP BY events_seawater_swap1.pool, (public.time_bucket('01:00:00'::interval, events_seawater_swap1.created_by)), events_seawater_newpool.decimals;


--
-- Name: seawater_pool_swap1_volume_hourly_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_pool_swap1_volume_hourly_1 AS
 SELECT events_seawater_swap1.pool,
    date_trunc('hour'::text, events_seawater_swap1.created_by) AS hourly_interval,
    (sum((events_seawater_swap1.amount1)::numeric))::public.hugeint AS fusdc_volume,
    (sum((events_seawater_swap1.amount0)::numeric))::public.hugeint AS tokena_volume
   FROM public.events_seawater_swap1
  GROUP BY events_seawater_swap1.pool, (date_trunc('hour'::text, events_seawater_swap1.created_by)), events_seawater_swap1.created_by;


--
-- Name: seawater_pool_swap2_price_hourly_1; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.seawater_pool_swap2_price_hourly_1 AS
 SELECT combined.pool,
    date_trunc('hour'::text, combined.created_by) AS hourly_interval,
    (((1.0001 ^ avg(combined.final_tick)) * (1000000)::numeric) / ((10)::numeric ^ (events_seawater_newpool.decimals)::numeric)) AS price,
    events_seawater_newpool.decimals
   FROM (( SELECT events_seawater_swap2.from_ AS pool,
            events_seawater_swap2.final_tick0 AS final_tick,
            events_seawater_swap2.created_by
           FROM public.events_seawater_swap2
        UNION ALL
         SELECT events_seawater_swap2.to_ AS pool,
            events_seawater_swap2.final_tick1 AS final_tick,
            events_seawater_swap2.created_by
           FROM public.events_seawater_swap2) combined
     LEFT JOIN public.events_seawater_newpool ON (((events_seawater_newpool.token)::bpchar = (combined.pool)::bpchar)))
  GROUP BY combined.pool, (date_trunc('hour'::text, combined.created_by)), events_seawater_newpool.decimals
  WITH NO DATA;


--
-- Name: seawater_pool_swap2_volume_hourly_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_pool_swap2_volume_hourly_1 AS
 SELECT combined.pool,
    date_trunc('hour'::text, combined.created_by) AS hourly_interval,
    (sum((combined.total_fluid_volume)::numeric))::public.hugeint AS fusdc_volume,
    (sum((combined.tokena_volume)::numeric))::public.hugeint AS tokena_volume
   FROM ( SELECT events_seawater_swap2.from_ AS pool,
            events_seawater_swap2.amount_in AS tokena_volume,
            events_seawater_swap2.fluid_volume AS total_fluid_volume,
            events_seawater_swap2.created_by
           FROM public.events_seawater_swap2
        UNION ALL
         SELECT events_seawater_swap2.to_ AS pool,
            events_seawater_swap2.amount_out AS tokena_volume,
            events_seawater_swap2.fluid_volume AS total_fluid_volume,
            events_seawater_swap2.created_by
           FROM public.events_seawater_swap2) combined
  GROUP BY combined.pool, (date_trunc('hour'::text, combined.created_by));


--
-- Name: seawater_swaps_average_price_hourly_1; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.seawater_swaps_average_price_hourly_1 AS
 SELECT combined.pool,
    combined.hourly_interval,
    sum(combined.price) AS price,
    combined.decimals
   FROM ( SELECT seawater_pool_swap1_price_hourly_1.pool,
            seawater_pool_swap1_price_hourly_1.hourly_interval,
            seawater_pool_swap1_price_hourly_1.price,
            seawater_pool_swap1_price_hourly_1.decimals
           FROM public.seawater_pool_swap1_price_hourly_1
        UNION ALL
         SELECT seawater_pool_swap2_price_hourly_1.pool,
            seawater_pool_swap2_price_hourly_1.hourly_interval,
            seawater_pool_swap2_price_hourly_1.price,
            seawater_pool_swap2_price_hourly_1.decimals
           FROM public.seawater_pool_swap2_price_hourly_1) combined
  GROUP BY combined.pool, combined.hourly_interval, combined.decimals
  WITH NO DATA;


--
-- Name: seawater_pool_swap_volume_hourly_1; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.seawater_pool_swap_volume_hourly_1 AS
 SELECT combined.pool,
    combined.hourly_interval,
    new_pool.decimals,
    (sum((combined.fusdc_volume)::numeric))::public.hugeint AS fusdc_volume_unscaled,
    sum(((combined.fusdc_volume)::double precision / ((10)::double precision ^ (6)::double precision))) AS fusdc_volume_scaled,
    sum((combined.tokena_volume)::numeric) AS tokena_volume_unscaled,
    (sum((combined.tokena_volume)::numeric) / ((10)::numeric ^ (new_pool.decimals)::numeric)) AS tokena_volume_scaled,
    sum((((combined.tokena_volume)::numeric / ((10)::numeric ^ (new_pool.decimals)::numeric)) * checkpoint.price)) AS sum
   FROM ((( SELECT seawater_pool_swap2_volume_hourly_1.pool,
            seawater_pool_swap2_volume_hourly_1.hourly_interval,
            seawater_pool_swap2_volume_hourly_1.fusdc_volume,
            seawater_pool_swap2_volume_hourly_1.tokena_volume
           FROM public.seawater_pool_swap2_volume_hourly_1
        UNION ALL
         SELECT seawater_pool_swap1_volume_hourly_1.pool,
            seawater_pool_swap1_volume_hourly_1.hourly_interval,
            seawater_pool_swap1_volume_hourly_1.fusdc_volume,
            seawater_pool_swap1_volume_hourly_1.tokena_volume
           FROM public.seawater_pool_swap1_volume_hourly_1) combined
     LEFT JOIN public.events_seawater_newpool new_pool ON (((new_pool.token)::bpchar = (combined.pool)::bpchar)))
     LEFT JOIN public.seawater_swaps_average_price_hourly_1 checkpoint ON ((combined.hourly_interval = checkpoint.hourly_interval)))
  GROUP BY combined.pool, combined.hourly_interval, new_pool.decimals
  ORDER BY combined.hourly_interval
  WITH NO DATA;


--
-- Name: seawater_pool_swap_volume_daily_1; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.seawater_pool_swap_volume_daily_1 AS
 SELECT floor(EXTRACT(epoch FROM now())) AS "timestamp",
    seawater_pool_swap_volume_hourly_1.pool AS token1_token,
    sum((seawater_pool_swap_volume_hourly_1.fusdc_volume_unscaled)::numeric) AS fusdc_value_unscaled,
    sum(seawater_pool_swap_volume_hourly_1.tokena_volume_unscaled) AS token1_value_unscaled,
    seawater_pool_swap_volume_hourly_1.decimals AS token1_decimals,
    public.time_bucket('1 day'::interval, seawater_pool_swap_volume_hourly_1.hourly_interval) AS interval_timestamp
   FROM public.seawater_pool_swap_volume_hourly_1
  GROUP BY (public.time_bucket('1 day'::interval, seawater_pool_swap_volume_hourly_1.hourly_interval)), seawater_pool_swap_volume_hourly_1.pool, seawater_pool_swap_volume_hourly_1.decimals
  ORDER BY (public.time_bucket('1 day'::interval, seawater_pool_swap_volume_hourly_1.hourly_interval)) DESC
  WITH NO DATA;


--
-- Name: seawater_pool_swap_volume_monthly_1; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.seawater_pool_swap_volume_monthly_1 AS
 SELECT floor(EXTRACT(epoch FROM now())) AS "timestamp",
    seawater_pool_swap_volume_hourly_1.pool AS token1_token,
    sum((seawater_pool_swap_volume_hourly_1.fusdc_volume_unscaled)::numeric) AS fusdc_value_unscaled,
    sum(seawater_pool_swap_volume_hourly_1.tokena_volume_unscaled) AS token1_value_unscaled,
    seawater_pool_swap_volume_hourly_1.decimals AS token1_decimals,
    public.time_bucket('1 mon'::interval, seawater_pool_swap_volume_hourly_1.hourly_interval) AS interval_timestamp
   FROM public.seawater_pool_swap_volume_hourly_1
  GROUP BY (public.time_bucket('1 mon'::interval, seawater_pool_swap_volume_hourly_1.hourly_interval)), seawater_pool_swap_volume_hourly_1.pool, seawater_pool_swap_volume_hourly_1.decimals
  ORDER BY (public.time_bucket('1 mon'::interval, seawater_pool_swap_volume_hourly_1.hourly_interval)) DESC
  WITH NO DATA;


--
-- Name: seawater_positions_2; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.seawater_positions_2 AS
 SELECT events_seawater_mintposition.created_by,
    events_seawater_mintposition.block_hash,
    events_seawater_mintposition.transaction_hash,
    events_seawater_mintposition.block_number AS created_block_number,
    events_seawater_mintposition.pos_id,
    COALESCE(transfers.to_, events_seawater_mintposition.owner) AS owner,
    events_seawater_mintposition.pool,
    events_seawater_mintposition.lower,
    events_seawater_mintposition.upper,
    vested.is_vested
   FROM ((public.events_seawater_mintposition
     LEFT JOIN public.events_seawater_transferposition transfers ON (((transfers.pos_id)::numeric = (events_seawater_mintposition.pos_id)::numeric)))
     LEFT JOIN public.seawater_positions_vested vested ON (((vested.position_id)::numeric = (events_seawater_mintposition.pos_id)::numeric)));


--
-- Name: snapshot_positions_latest_1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.snapshot_positions_latest_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: snapshot_positions_latest_1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.snapshot_positions_latest_1_id_seq OWNED BY public.snapshot_positions_latest_1.id;


--
-- Name: snapshot_positions_latest_decimals_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.snapshot_positions_latest_decimals_1 AS
 SELECT snapshot_positions_latest_1.id,
    snapshot_positions_latest_1.updated_by,
    snapshot_positions_latest_1.pos_id,
    snapshot_positions_latest_1.owner,
    snapshot_positions_latest_1.pool,
    snapshot_positions_latest_1.lower,
    snapshot_positions_latest_1.upper,
    snapshot_positions_latest_1.amount0,
    snapshot_positions_latest_1.amount1,
    pool.decimals
   FROM (public.snapshot_positions_latest_1
     LEFT JOIN public.events_seawater_newpool pool ON (((pool.token)::bpchar = (snapshot_positions_latest_1.pool)::bpchar)));


--
-- Name: snapshot_positions_latest_decimals_grouped_1; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.snapshot_positions_latest_decimals_grouped_1 AS
 SELECT snapshot_positions_latest_decimals_1.pool,
    snapshot_positions_latest_decimals_1.decimals,
    sum((snapshot_positions_latest_decimals_1.amount0)::numeric) AS cumulative_amount0,
    sum((snapshot_positions_latest_decimals_1.amount1)::numeric) AS cumulative_amount1
   FROM public.snapshot_positions_latest_decimals_1
  GROUP BY snapshot_positions_latest_decimals_1.pool, snapshot_positions_latest_decimals_1.decimals;


--
-- Name: snapshot_positions_log_1; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.snapshot_positions_log_1 (
    id integer NOT NULL,
    created_by timestamp without time zone NOT NULL,
    pos_id public.hugeint NOT NULL,
    owner public.address NOT NULL,
    pool public.address NOT NULL,
    lower bigint NOT NULL,
    upper bigint NOT NULL,
    amount0 public.hugeint NOT NULL,
    amount1 public.hugeint NOT NULL
);


--
-- Name: snapshot_positions_log_1_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.snapshot_positions_log_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: snapshot_positions_log_1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.snapshot_positions_log_1_id_seq OWNED BY public.snapshot_positions_log_1.id;


--
-- Name: _hyper_34_30_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_30_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_30_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_30_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_31_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_31_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_31_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_31_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_67_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_67_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_67_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_67_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_68_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_68_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_68_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_68_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_70_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_70_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_70_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_70_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_73_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_73_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_73_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_73_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_75_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_75_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_75_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_75_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_77_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_77_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_77_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_77_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_79_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_79_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_79_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_79_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_34_81_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_81_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: _hyper_34_81_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_81_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_26_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_26_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_26_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_26_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_28_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_28_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_28_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_28_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_29_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_29_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_29_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_29_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_32_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_32_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_32_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_32_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_66_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_66_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_66_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_66_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_69_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_69_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_69_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_69_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_71_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_71_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_71_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_71_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_72_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_72_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_72_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_72_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_74_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_74_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_74_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_74_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_76_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_76_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_76_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_76_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_78_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_78_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_78_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_78_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: _hyper_35_80_chunk id; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_80_chunk ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: _hyper_35_80_chunk created_by; Type: DEFAULT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_80_chunk ALTER COLUMN created_by SET DEFAULT CURRENT_TIMESTAMP;


--
-- Name: erc20_cache_1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.erc20_cache_1 ALTER COLUMN id SET DEFAULT nextval('public.erc20_cache_1_id_seq'::regclass);


--
-- Name: events_erc20_transfer id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_erc20_transfer ALTER COLUMN id SET DEFAULT nextval('public.events_erc20_transfer_id_seq'::regclass);


--
-- Name: events_leo_campaignbalanceupdated id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_campaignbalanceupdated ALTER COLUMN id SET DEFAULT nextval('public.events_leo_campaignbalanceupdated_id_seq'::regclass);


--
-- Name: events_leo_campaigncreated id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_campaigncreated ALTER COLUMN id SET DEFAULT nextval('public.events_leo_campaigncreated_id_seq'::regclass);


--
-- Name: events_leo_campaignupdated id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_campaignupdated ALTER COLUMN id SET DEFAULT nextval('public.events_leo_campaignupdated_id_seq'::regclass);


--
-- Name: events_leo_positiondivested id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_positiondivested ALTER COLUMN id SET DEFAULT nextval('public.events_leo_positiondivested_id_seq'::regclass);


--
-- Name: events_leo_positionvested id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_positionvested ALTER COLUMN id SET DEFAULT nextval('public.events_leo_positionvested_id_seq'::regclass);


--
-- Name: events_seawater_burnposition id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_burnposition ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_burnposition_id_seq'::regclass);


--
-- Name: events_seawater_collectfees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_collectfees ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_collectfees_id_seq'::regclass);


--
-- Name: events_seawater_collectprotocolfees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_collectprotocolfees ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_collectprotocolfees_id_seq'::regclass);


--
-- Name: events_seawater_mintposition id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_mintposition ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_mintposition_id_seq'::regclass);


--
-- Name: events_seawater_newpool id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_newpool ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_newpool_id_seq'::regclass);


--
-- Name: events_seawater_swap1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_swap1 ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap1_id_seq'::regclass);


--
-- Name: events_seawater_swap2 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_swap2 ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_swap2_id_seq'::regclass);


--
-- Name: events_seawater_transferposition id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_transferposition ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_transferposition_id_seq'::regclass);


--
-- Name: events_seawater_updatepositionliquidity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_updatepositionliquidity ALTER COLUMN id SET DEFAULT nextval('public.events_seawater_updatepositionliquidity_id_seq'::regclass);


--
-- Name: events_thirdweb_accountcreated id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_thirdweb_accountcreated ALTER COLUMN id SET DEFAULT nextval('public.events_thirdweb_accountcreated_id_seq'::regclass);


--
-- Name: faucet_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faucet_requests ALTER COLUMN id SET DEFAULT nextval('public.faucet_requests_id_seq'::regclass);


--
-- Name: ingestor_checkpointing_1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingestor_checkpointing_1 ALTER COLUMN id SET DEFAULT nextval('public.ingestor_checkpointing_1_id_seq'::regclass);


--
-- Name: ninelives_frontpage_1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninelives_frontpage_1 ALTER COLUMN id SET DEFAULT nextval('public.ninelives_frontpage_1_id_seq'::regclass);


--
-- Name: notes_1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes_1 ALTER COLUMN id SET DEFAULT nextval('public.notes_1_id_seq'::regclass);


--
-- Name: snapshot_positions_latest_1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.snapshot_positions_latest_1 ALTER COLUMN id SET DEFAULT nextval('public.snapshot_positions_latest_1_id_seq'::regclass);


--
-- Name: snapshot_positions_log_1 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.snapshot_positions_log_1 ALTER COLUMN id SET DEFAULT nextval('public.snapshot_positions_log_1_id_seq'::regclass);


--
-- Name: _hyper_35_26_chunk 26_17_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_26_chunk
    ADD CONSTRAINT "26_17_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_28_chunk 28_18_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_28_chunk
    ADD CONSTRAINT "28_18_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_29_chunk 29_19_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_29_chunk
    ADD CONSTRAINT "29_19_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_30_chunk 30_20_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_30_chunk
    ADD CONSTRAINT "30_20_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_31_chunk 31_21_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_31_chunk
    ADD CONSTRAINT "31_21_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_32_chunk 32_22_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_32_chunk
    ADD CONSTRAINT "32_22_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_66_chunk 66_23_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_66_chunk
    ADD CONSTRAINT "66_23_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_67_chunk 67_24_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_67_chunk
    ADD CONSTRAINT "67_24_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_68_chunk 68_25_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_68_chunk
    ADD CONSTRAINT "68_25_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_69_chunk 69_26_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_69_chunk
    ADD CONSTRAINT "69_26_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_70_chunk 70_27_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_70_chunk
    ADD CONSTRAINT "70_27_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_71_chunk 71_28_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_71_chunk
    ADD CONSTRAINT "71_28_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_72_chunk 72_29_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_72_chunk
    ADD CONSTRAINT "72_29_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_73_chunk 73_30_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_73_chunk
    ADD CONSTRAINT "73_30_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_74_chunk 74_31_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_74_chunk
    ADD CONSTRAINT "74_31_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_75_chunk 75_32_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_75_chunk
    ADD CONSTRAINT "75_32_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_76_chunk 76_33_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_76_chunk
    ADD CONSTRAINT "76_33_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_77_chunk 77_34_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_77_chunk
    ADD CONSTRAINT "77_34_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_78_chunk 78_35_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_78_chunk
    ADD CONSTRAINT "78_35_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_79_chunk 79_36_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_79_chunk
    ADD CONSTRAINT "79_36_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_35_80_chunk 80_37_events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_35_80_chunk
    ADD CONSTRAINT "80_37_events_seawater_swap1_pkey" PRIMARY KEY (id, created_by);


--
-- Name: _hyper_34_81_chunk 81_38_events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: _timescaledb_internal; Owner: -
--

ALTER TABLE ONLY _timescaledb_internal._hyper_34_81_chunk
    ADD CONSTRAINT "81_38_events_seawater_swap2_pkey" PRIMARY KEY (id, created_by);


--
-- Name: erc20_cache_1 erc20_cache_1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.erc20_cache_1
    ADD CONSTRAINT erc20_cache_1_pkey PRIMARY KEY (id);


--
-- Name: events_erc20_transfer events_erc20_transfer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_erc20_transfer
    ADD CONSTRAINT events_erc20_transfer_pkey PRIMARY KEY (id);


--
-- Name: events_leo_campaignbalanceupdated events_leo_campaignbalanceupdated_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_campaignbalanceupdated
    ADD CONSTRAINT events_leo_campaignbalanceupdated_pkey PRIMARY KEY (id);


--
-- Name: events_leo_campaigncreated events_leo_campaigncreated_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_campaigncreated
    ADD CONSTRAINT events_leo_campaigncreated_pkey PRIMARY KEY (id);


--
-- Name: events_leo_campaignupdated events_leo_campaignupdated_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_campaignupdated
    ADD CONSTRAINT events_leo_campaignupdated_pkey PRIMARY KEY (id);


--
-- Name: events_leo_positiondivested events_leo_positiondivested_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_positiondivested
    ADD CONSTRAINT events_leo_positiondivested_pkey PRIMARY KEY (id);


--
-- Name: events_leo_positionvested events_leo_positionvested_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_leo_positionvested
    ADD CONSTRAINT events_leo_positionvested_pkey PRIMARY KEY (id);


--
-- Name: events_seawater_burnposition events_seawater_burnposition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_burnposition
    ADD CONSTRAINT events_seawater_burnposition_pkey PRIMARY KEY (id);


--
-- Name: events_seawater_collectfees events_seawater_collectfees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_collectfees
    ADD CONSTRAINT events_seawater_collectfees_pkey PRIMARY KEY (id);


--
-- Name: events_seawater_collectprotocolfees events_seawater_collectprotocolfees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_collectprotocolfees
    ADD CONSTRAINT events_seawater_collectprotocolfees_pkey PRIMARY KEY (id);


--
-- Name: events_seawater_mintposition events_seawater_mintposition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_mintposition
    ADD CONSTRAINT events_seawater_mintposition_pkey PRIMARY KEY (id);


--
-- Name: events_seawater_newpool events_seawater_newpool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_newpool
    ADD CONSTRAINT events_seawater_newpool_pkey PRIMARY KEY (id);


--
-- Name: events_seawater_swap1 events_seawater_swap1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_swap1
    ADD CONSTRAINT events_seawater_swap1_pkey PRIMARY KEY (id, created_by);


--
-- Name: events_seawater_swap2 events_seawater_swap2_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_swap2
    ADD CONSTRAINT events_seawater_swap2_pkey PRIMARY KEY (id, created_by);


--
-- Name: events_seawater_transferposition events_seawater_transferposition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_transferposition
    ADD CONSTRAINT events_seawater_transferposition_pkey PRIMARY KEY (id);


--
-- Name: events_seawater_updatepositionliquidity events_seawater_updatepositionliquidity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_seawater_updatepositionliquidity
    ADD CONSTRAINT events_seawater_updatepositionliquidity_pkey PRIMARY KEY (id);


--
-- Name: events_thirdweb_accountcreated events_thirdweb_accountcreated_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_thirdweb_accountcreated
    ADD CONSTRAINT events_thirdweb_accountcreated_pkey PRIMARY KEY (id);


--
-- Name: faucet_requests faucet_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faucet_requests
    ADD CONSTRAINT faucet_requests_pkey PRIMARY KEY (id);


--
-- Name: ingestor_checkpointing_1 ingestor_checkpointing_1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingestor_checkpointing_1
    ADD CONSTRAINT ingestor_checkpointing_1_pkey PRIMARY KEY (id);


--
-- Name: ninelives_campaigns_1 ninelives_campaigns_1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninelives_campaigns_1
    ADD CONSTRAINT ninelives_campaigns_1_pkey PRIMARY KEY (id);


--
-- Name: ninelives_frontpage_1 ninelives_frontpage_1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninelives_frontpage_1
    ADD CONSTRAINT ninelives_frontpage_1_pkey PRIMARY KEY (id);


--
-- Name: ninelives_migrations ninelives_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninelives_migrations
    ADD CONSTRAINT ninelives_migrations_pkey PRIMARY KEY (version);


--
-- Name: notes_1 notes_1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes_1
    ADD CONSTRAINT notes_1_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: snapshot_positions_latest_1 snapshot_positions_latest_1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.snapshot_positions_latest_1
    ADD CONSTRAINT snapshot_positions_latest_1_pkey PRIMARY KEY (id);


--
-- Name: snapshot_positions_log_1 snapshot_positions_log_1_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.snapshot_positions_log_1
    ADD CONSTRAINT snapshot_positions_log_1_pkey PRIMARY KEY (id);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_30_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_30_chunk USING btree (from_);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_30_chunk USING btree (from_);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_30_chunk USING btree (from_);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_30_chunk USING btree (to_);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_30_chunk USING btree (to_);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_30_chunk USING btree (to_);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_30_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_30_chunk USING btree (user_);


--
-- Name: _hyper_34_30_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_30_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_30_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_31_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_31_chunk USING btree (from_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_31_chunk USING btree (from_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_31_chunk USING btree (from_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_31_chunk USING btree (to_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_31_chunk USING btree (to_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_31_chunk USING btree (to_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_31_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_31_chunk USING btree (user_);


--
-- Name: _hyper_34_31_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_31_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_31_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_67_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_67_chunk USING btree (from_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_67_chunk USING btree (from_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_67_chunk USING btree (from_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_67_chunk USING btree (to_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_67_chunk USING btree (to_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_67_chunk USING btree (to_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_67_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_67_chunk USING btree (user_);


--
-- Name: _hyper_34_67_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_67_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_67_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_68_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_68_chunk USING btree (from_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_68_chunk USING btree (from_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_68_chunk USING btree (from_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_68_chunk USING btree (to_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_68_chunk USING btree (to_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_68_chunk USING btree (to_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_68_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_68_chunk USING btree (user_);


--
-- Name: _hyper_34_68_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_68_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_68_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_70_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_70_chunk USING btree (from_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_70_chunk USING btree (from_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_70_chunk USING btree (from_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_70_chunk USING btree (to_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_70_chunk USING btree (to_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_70_chunk USING btree (to_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_70_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_70_chunk USING btree (user_);


--
-- Name: _hyper_34_70_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_70_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_70_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_73_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_73_chunk USING btree (from_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_73_chunk USING btree (from_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_73_chunk USING btree (from_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_73_chunk USING btree (to_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_73_chunk USING btree (to_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_73_chunk USING btree (to_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_73_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_73_chunk USING btree (user_);


--
-- Name: _hyper_34_73_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_73_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_73_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_75_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_75_chunk USING btree (from_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_75_chunk USING btree (from_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_75_chunk USING btree (from_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_75_chunk USING btree (to_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_75_chunk USING btree (to_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_75_chunk USING btree (to_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_75_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_75_chunk USING btree (user_);


--
-- Name: _hyper_34_75_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_75_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_75_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_77_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_77_chunk USING btree (from_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_77_chunk USING btree (from_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_77_chunk USING btree (from_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_77_chunk USING btree (to_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_77_chunk USING btree (to_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_77_chunk USING btree (to_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_77_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_77_chunk USING btree (user_);


--
-- Name: _hyper_34_77_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_77_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_77_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_79_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_79_chunk USING btree (from_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_79_chunk USING btree (from_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_79_chunk USING btree (from_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_79_chunk USING btree (to_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_79_chunk USING btree (to_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_79_chunk USING btree (to_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_79_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_79_chunk USING btree (user_);


--
-- Name: _hyper_34_79_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_79_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_79_chunk USING btree (user_, to_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_created_by_idx ON _timescaledb_internal._hyper_34_81_chunk USING btree (created_by DESC);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_from__idx ON _timescaledb_internal._hyper_34_81_chunk USING btree (from_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_from__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_from__idx1 ON _timescaledb_internal._hyper_34_81_chunk USING btree (from_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_from__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_from__idx2 ON _timescaledb_internal._hyper_34_81_chunk USING btree (from_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_to__idx ON _timescaledb_internal._hyper_34_81_chunk USING btree (to_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_to__idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_to__idx1 ON _timescaledb_internal._hyper_34_81_chunk USING btree (to_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_to__idx2; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_to__idx2 ON _timescaledb_internal._hyper_34_81_chunk USING btree (to_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_user__from__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_user__from__idx ON _timescaledb_internal._hyper_34_81_chunk USING btree (user_, from_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_user__idx ON _timescaledb_internal._hyper_34_81_chunk USING btree (user_);


--
-- Name: _hyper_34_81_chunk_events_seawater_swap2_user__to__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_34_81_chunk_events_seawater_swap2_user__to__idx ON _timescaledb_internal._hyper_34_81_chunk USING btree (user_, to_);


--
-- Name: _hyper_35_26_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_26_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_26_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_26_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_26_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_26_chunk USING btree (pool);


--
-- Name: _hyper_35_26_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_26_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_26_chunk USING btree (pool);


--
-- Name: _hyper_35_26_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_26_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_26_chunk USING btree (user_);


--
-- Name: _hyper_35_26_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_26_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_26_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_28_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_28_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_28_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_28_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_28_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_28_chunk USING btree (pool);


--
-- Name: _hyper_35_28_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_28_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_28_chunk USING btree (pool);


--
-- Name: _hyper_35_28_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_28_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_28_chunk USING btree (user_);


--
-- Name: _hyper_35_28_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_28_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_28_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_29_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_29_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_29_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_29_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_29_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_29_chunk USING btree (pool);


--
-- Name: _hyper_35_29_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_29_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_29_chunk USING btree (pool);


--
-- Name: _hyper_35_29_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_29_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_29_chunk USING btree (user_);


--
-- Name: _hyper_35_29_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_29_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_29_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_32_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_32_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_32_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_32_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_32_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_32_chunk USING btree (pool);


--
-- Name: _hyper_35_32_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_32_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_32_chunk USING btree (pool);


--
-- Name: _hyper_35_32_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_32_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_32_chunk USING btree (user_);


--
-- Name: _hyper_35_32_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_32_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_32_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_66_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_66_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_66_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_66_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_66_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_66_chunk USING btree (pool);


--
-- Name: _hyper_35_66_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_66_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_66_chunk USING btree (pool);


--
-- Name: _hyper_35_66_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_66_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_66_chunk USING btree (user_);


--
-- Name: _hyper_35_66_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_66_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_66_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_69_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_69_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_69_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_69_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_69_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_69_chunk USING btree (pool);


--
-- Name: _hyper_35_69_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_69_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_69_chunk USING btree (pool);


--
-- Name: _hyper_35_69_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_69_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_69_chunk USING btree (user_);


--
-- Name: _hyper_35_69_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_69_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_69_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_71_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_71_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_71_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_71_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_71_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_71_chunk USING btree (pool);


--
-- Name: _hyper_35_71_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_71_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_71_chunk USING btree (pool);


--
-- Name: _hyper_35_71_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_71_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_71_chunk USING btree (user_);


--
-- Name: _hyper_35_71_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_71_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_71_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_72_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_72_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_72_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_72_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_72_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_72_chunk USING btree (pool);


--
-- Name: _hyper_35_72_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_72_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_72_chunk USING btree (pool);


--
-- Name: _hyper_35_72_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_72_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_72_chunk USING btree (user_);


--
-- Name: _hyper_35_72_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_72_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_72_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_74_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_74_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_74_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_74_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_74_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_74_chunk USING btree (pool);


--
-- Name: _hyper_35_74_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_74_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_74_chunk USING btree (pool);


--
-- Name: _hyper_35_74_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_74_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_74_chunk USING btree (user_);


--
-- Name: _hyper_35_74_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_74_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_74_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_76_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_76_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_76_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_76_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_76_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_76_chunk USING btree (pool);


--
-- Name: _hyper_35_76_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_76_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_76_chunk USING btree (pool);


--
-- Name: _hyper_35_76_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_76_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_76_chunk USING btree (user_);


--
-- Name: _hyper_35_76_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_76_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_76_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_78_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_78_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_78_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_78_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_78_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_78_chunk USING btree (pool);


--
-- Name: _hyper_35_78_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_78_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_78_chunk USING btree (pool);


--
-- Name: _hyper_35_78_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_78_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_78_chunk USING btree (user_);


--
-- Name: _hyper_35_78_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_78_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_78_chunk USING btree (user_, pool);


--
-- Name: _hyper_35_80_chunk_events_seawater_swap1_created_by_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_80_chunk_events_seawater_swap1_created_by_idx ON _timescaledb_internal._hyper_35_80_chunk USING btree (created_by DESC);


--
-- Name: _hyper_35_80_chunk_events_seawater_swap1_pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_80_chunk_events_seawater_swap1_pool_idx ON _timescaledb_internal._hyper_35_80_chunk USING btree (pool);


--
-- Name: _hyper_35_80_chunk_events_seawater_swap1_pool_idx1; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_80_chunk_events_seawater_swap1_pool_idx1 ON _timescaledb_internal._hyper_35_80_chunk USING btree (pool);


--
-- Name: _hyper_35_80_chunk_events_seawater_swap1_user__idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_80_chunk_events_seawater_swap1_user__idx ON _timescaledb_internal._hyper_35_80_chunk USING btree (user_);


--
-- Name: _hyper_35_80_chunk_events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_35_80_chunk_events_seawater_swap1_user__pool_idx ON _timescaledb_internal._hyper_35_80_chunk USING btree (user_, pool);


--
-- Name: _hyper_37_27_chunk__materialized_hypertable_37_decimals_hourly_; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_37_27_chunk__materialized_hypertable_37_decimals_hourly_ ON _timescaledb_internal._hyper_37_27_chunk USING btree (decimals, hourly_interval DESC);


--
-- Name: _hyper_37_27_chunk__materialized_hypertable_37_hourly_interval_; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_37_27_chunk__materialized_hypertable_37_hourly_interval_ ON _timescaledb_internal._hyper_37_27_chunk USING btree (hourly_interval DESC);


--
-- Name: _hyper_37_27_chunk__materialized_hypertable_37_pool_hourly_inte; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_37_27_chunk__materialized_hypertable_37_pool_hourly_inte ON _timescaledb_internal._hyper_37_27_chunk USING btree (pool, hourly_interval DESC);


--
-- Name: _hyper_37_33_chunk__materialized_hypertable_37_decimals_hourly_; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_37_33_chunk__materialized_hypertable_37_decimals_hourly_ ON _timescaledb_internal._hyper_37_33_chunk USING btree (decimals, hourly_interval DESC);


--
-- Name: _hyper_37_33_chunk__materialized_hypertable_37_hourly_interval_; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_37_33_chunk__materialized_hypertable_37_hourly_interval_ ON _timescaledb_internal._hyper_37_33_chunk USING btree (hourly_interval DESC);


--
-- Name: _hyper_37_33_chunk__materialized_hypertable_37_pool_hourly_inte; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_37_33_chunk__materialized_hypertable_37_pool_hourly_inte ON _timescaledb_internal._hyper_37_33_chunk USING btree (pool, hourly_interval DESC);


--
-- Name: _materialized_hypertable_37_decimals_hourly_interval_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _materialized_hypertable_37_decimals_hourly_interval_idx ON _timescaledb_internal._materialized_hypertable_37 USING btree (decimals, hourly_interval DESC);


--
-- Name: _materialized_hypertable_37_hourly_interval_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _materialized_hypertable_37_hourly_interval_idx ON _timescaledb_internal._materialized_hypertable_37 USING btree (hourly_interval DESC);


--
-- Name: _materialized_hypertable_37_pool_hourly_interval_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _materialized_hypertable_37_pool_hourly_interval_idx ON _timescaledb_internal._materialized_hypertable_37 USING btree (pool, hourly_interval DESC);


--
-- Name: erc20_cache_1_address_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX erc20_cache_1_address_idx ON public.erc20_cache_1 USING btree (address);


--
-- Name: erc20_cache_1_address_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX erc20_cache_1_address_idx1 ON public.erc20_cache_1 USING btree (address);


--
-- Name: events_leo_campaigncreated_identifier_pool_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_leo_campaigncreated_identifier_pool_idx ON public.events_leo_campaigncreated USING btree (identifier, pool);


--
-- Name: events_seawater_burnposition_owner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_seawater_burnposition_owner_idx ON public.events_seawater_burnposition USING btree (owner);


--
-- Name: events_seawater_burnposition_pos_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_seawater_burnposition_pos_id_idx ON public.events_seawater_burnposition USING btree (pos_id);


--
-- Name: events_seawater_collectfees_pool_to__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_collectfees_pool_to__idx ON public.events_seawater_collectfees USING btree (pool, to_);


--
-- Name: events_seawater_collectfees_pos_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_collectfees_pos_id_idx ON public.events_seawater_collectfees USING btree (pos_id);


--
-- Name: events_seawater_collectprotocolfees_pool_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_collectprotocolfees_pool_idx ON public.events_seawater_collectprotocolfees USING btree (pool);


--
-- Name: events_seawater_collectprotocolfees_pool_to__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_collectprotocolfees_pool_to__idx ON public.events_seawater_collectprotocolfees USING btree (pool, to_);


--
-- Name: events_seawater_collectprotocolfees_to__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_collectprotocolfees_to__idx ON public.events_seawater_collectprotocolfees USING btree (to_);


--
-- Name: events_seawater_mintposition_owner_pool_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_mintposition_owner_pool_idx ON public.events_seawater_mintposition USING btree (owner, pool);


--
-- Name: events_seawater_mintposition_pos_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_seawater_mintposition_pos_id_idx ON public.events_seawater_mintposition USING btree (pos_id);


--
-- Name: events_seawater_newpool_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_seawater_newpool_token_idx ON public.events_seawater_newpool USING btree (token);


--
-- Name: events_seawater_swap1_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap1_created_by_idx ON public.events_seawater_swap1 USING btree (created_by DESC);


--
-- Name: events_seawater_swap1_pool_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap1_pool_idx ON public.events_seawater_swap1 USING btree (pool);


--
-- Name: events_seawater_swap1_pool_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap1_pool_idx1 ON public.events_seawater_swap1 USING btree (pool);


--
-- Name: events_seawater_swap1_user__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap1_user__idx ON public.events_seawater_swap1 USING btree (user_);


--
-- Name: events_seawater_swap1_user__pool_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap1_user__pool_idx ON public.events_seawater_swap1 USING btree (user_, pool);


--
-- Name: events_seawater_swap2_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_created_by_idx ON public.events_seawater_swap2 USING btree (created_by DESC);


--
-- Name: events_seawater_swap2_from__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_from__idx ON public.events_seawater_swap2 USING btree (from_);


--
-- Name: events_seawater_swap2_from__idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_from__idx1 ON public.events_seawater_swap2 USING btree (from_);


--
-- Name: events_seawater_swap2_from__idx2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_from__idx2 ON public.events_seawater_swap2 USING btree (from_);


--
-- Name: events_seawater_swap2_to__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_to__idx ON public.events_seawater_swap2 USING btree (to_);


--
-- Name: events_seawater_swap2_to__idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_to__idx1 ON public.events_seawater_swap2 USING btree (to_);


--
-- Name: events_seawater_swap2_to__idx2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_to__idx2 ON public.events_seawater_swap2 USING btree (to_);


--
-- Name: events_seawater_swap2_user__from__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_user__from__idx ON public.events_seawater_swap2 USING btree (user_, from_);


--
-- Name: events_seawater_swap2_user__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_user__idx ON public.events_seawater_swap2 USING btree (user_);


--
-- Name: events_seawater_swap2_user__to__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_swap2_user__to__idx ON public.events_seawater_swap2 USING btree (user_, to_);


--
-- Name: events_seawater_transferposition_from__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_transferposition_from__idx ON public.events_seawater_transferposition USING btree (from_);


--
-- Name: events_seawater_transferposition_pos_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_transferposition_pos_id_idx ON public.events_seawater_transferposition USING btree (pos_id);


--
-- Name: events_seawater_transferposition_to__idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_transferposition_to__idx ON public.events_seawater_transferposition USING btree (to_);


--
-- Name: events_seawater_updatepositionliquidity_block_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_updatepositionliquidity_block_number_idx ON public.events_seawater_updatepositionliquidity USING btree (block_number);


--
-- Name: events_seawater_updatepositionliquidity_block_number_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_updatepositionliquidity_block_number_idx1 ON public.events_seawater_updatepositionliquidity USING btree (block_number);


--
-- Name: events_seawater_updatepositionliquidity_pos_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_seawater_updatepositionliquidity_pos_id_idx ON public.events_seawater_updatepositionliquidity USING btree (pos_id);


--
-- Name: faucet_requests_addr_was_sent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX faucet_requests_addr_was_sent_idx ON public.faucet_requests USING btree (addr, was_sent) WHERE (NOT was_sent);


--
-- Name: faucet_requests_ip_addr_was_sent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX faucet_requests_ip_addr_was_sent_idx ON public.faucet_requests USING btree (ip_addr, was_sent) WHERE (NOT was_sent);


--
-- Name: faucet_requests_ip_addr_was_sent_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX faucet_requests_ip_addr_was_sent_idx1 ON public.faucet_requests USING btree (ip_addr, was_sent) WHERE (NOT was_sent);


--
-- Name: ninelives_frontpage_1_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ninelives_frontpage_1_created_at_idx ON public.ninelives_frontpage_1 USING btree (created_at);


--
-- Name: ninelives_frontpage_1_until_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ninelives_frontpage_1_until_idx ON public.ninelives_frontpage_1 USING btree (until);


--
-- Name: seawater_active_positions_2_owner_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX seawater_active_positions_2_owner_created_by_idx ON public.seawater_active_positions_2 USING btree (owner, created_by DESC);


--
-- Name: seawater_active_positions_2_owner_created_by_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX seawater_active_positions_2_owner_created_by_idx1 ON public.seawater_active_positions_2 USING btree (owner, created_by DESC);


--
-- Name: seawater_active_positions_2_pool_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX seawater_active_positions_2_pool_created_by_idx ON public.seawater_active_positions_2 USING btree (pool, created_by DESC);


--
-- Name: seawater_active_positions_2_pool_created_by_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX seawater_active_positions_2_pool_created_by_idx1 ON public.seawater_active_positions_2 USING btree (pool, created_by DESC);


--
-- Name: snapshot_positions_latest_1_pos_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX snapshot_positions_latest_1_pos_id_idx ON public.snapshot_positions_latest_1 USING btree (pos_id);


--
-- Name: snapshot_positions_latest_1_pos_id_idx1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX snapshot_positions_latest_1_pos_id_idx1 ON public.snapshot_positions_latest_1 USING btree (pos_id);


--
-- Name: _hyper_35_26_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_26_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_28_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_28_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_29_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_29_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_32_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_32_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_66_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_66_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_69_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_69_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_71_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_71_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_72_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_72_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_74_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_74_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_76_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_76_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_78_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_78_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _hyper_35_80_chunk ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON _timescaledb_internal._hyper_35_80_chunk FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: _materialized_hypertable_37 ts_insert_blocker; Type: TRIGGER; Schema: _timescaledb_internal; Owner: -
--

CREATE TRIGGER ts_insert_blocker BEFORE INSERT ON _timescaledb_internal._materialized_hypertable_37 FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.insert_blocker();


--
-- Name: events_seawater_swap1 ts_cagg_invalidation_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ts_cagg_invalidation_trigger AFTER INSERT OR DELETE OR UPDATE ON public.events_seawater_swap1 FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.continuous_agg_invalidation_trigger('35');


--
-- Name: events_seawater_swap1 ts_insert_blocker; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ts_insert_blocker BEFORE INSERT ON public.events_seawater_swap1 FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.insert_blocker();


--
-- Name: events_seawater_swap2 ts_insert_blocker; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ts_insert_blocker BEFORE INSERT ON public.events_seawater_swap2 FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.insert_blocker();


--
-- Name: ninelives_frontpage_1 fk_campaign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ninelives_frontpage_1
    ADD CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES public.ninelives_campaigns_1(id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.ninelives_migrations (version) VALUES
    ('1726296116');
