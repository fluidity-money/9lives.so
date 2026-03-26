-- migrate:up

SELECT cron.schedule(
    'ninelives-delete-old-prices',
    '0 3 * * 1',
    $$DELETE FROM oracles_ninelives_prices_2 WHERE created_by < NOW() - INTERVAL '14 days'$$
);

-- migrate:down
