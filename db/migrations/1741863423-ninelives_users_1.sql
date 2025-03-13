-- migrate:up

CREATE TABLE ninelives_users_1 (
    wallet_address ADDRESS PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    settings JSONB
)

-- migrate:down
