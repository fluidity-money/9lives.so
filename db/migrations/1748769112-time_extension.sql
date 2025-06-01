-- migrate:up

CREATE FUNCTION ninelives_time_extension_1(
	cid BYTES8,
	new_ts INTEGER
)
RETURNS VOID LANGUAGE PLPGSQL
AS $$
BEGIN
	UPDATE ninelives_buys_and_sells_1
	SET campaign_content = jsonb_set(campaign_content, '{ending}', to_jsonb(new_ts))
	WHERE campaign_id = cid;
	UPDATE ninelives_campaigns_1
	SET content = jsonb_set(content, '{ending}', to_jsonb(new_ts))
	WHERE id = '0x' || cid;
END $$;

-- migrate:down
