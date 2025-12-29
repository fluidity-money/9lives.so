FROM superposition/go-build:latest AS build

RUN cd /usr/local/src/superposition/cmd/graphql.ethereum && \
	go build

FROM golang:1.26rc1-alpine3.23 AS runtime

COPY --from=build /usr/local/src/superposition/cmd/graphql.ethereum/graphql.ethereum .

ENTRYPOINT ["./graphql.ethereum"]
