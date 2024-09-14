
FROM postgres:16-alpine

WORKDIR /usr/local/src/ninelives/database

RUN apk add make curl

RUN curl -fsSLo \
	/usr/local/bin/dbmate \
	https://github.com/amacneil/dbmate/releases/latest/download/dbmate-linux-amd64

RUN chmod +x /usr/local/bin/dbmate

COPY migrations/ .

COPY init.sh /docker-entrypoint-initdb.d/init-sqls.sh
