
# websocket.database

Uses a Postgres CDC to get updates to tables we send to our users over websocket.

Warning: this code is horrible. We partly programmed this after we had a leak with Claude
and it over engineered it and took it down a crap path.
