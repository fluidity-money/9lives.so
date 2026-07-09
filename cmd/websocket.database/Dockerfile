FROM superposition/go-build:latest AS build

RUN cd /usr/local/src/superposition/cmd/websocket.database && \
	make

FROM golang:1.26rc1-alpine3.23 AS runtime

COPY --from=build /usr/local/src/superposition/cmd/websocket.database/websocket.database .

ENTRYPOINT ["./websocket.database"]
