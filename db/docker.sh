#!/bin/sh

docker build -t ninelives/database .

# Usually pg_cron config settings would be in postgresql.conf
# but changing them in an init script doesn't seem to be respected
docker run \
	-e POSTGRES_USER=${POSTGRES_USER:-superposition} \
	-e POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-superposition} \
	-v "$(pwd)/volume":/var/lib/postgresql/data \
	-p 5432:5432 \
	docker.io/ninelives/database \
	-c log_statement=all
