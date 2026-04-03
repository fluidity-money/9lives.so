-- migrate:up

SELECT cron.schedule(
    'ninelives-delete-old-prices',
    '*/30 * * * *',
    $$DELETE FROM oracles_ninelives_prices_3 WHERE created_by < NOW() - INTERVAL '2 hours'$$
);

-- migrate:down
