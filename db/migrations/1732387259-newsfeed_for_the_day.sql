-- migrate:up

CREATE VIEW ninelives_newsfeed_for_today_1 AS
	SELECT DISTINCT headline FROM ninelives_newsfeed_1
	WHERE DATE(date) = CURRENT_DATE;

-- migrate:down
