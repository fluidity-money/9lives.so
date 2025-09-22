-- migrate:up

CREATE TABLE ninelives_comments_1 (
    id SERIAL PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    wallet_address ADDRESS NOT NULL,
    content TEXT CHECK (char_length(content) <= 2000) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    FOREIGN KEY (campaign_id)
    REFERENCES ninelives_campaigns_1 (id)
    ON DELETE CASCADE
);

-- migrate:down
