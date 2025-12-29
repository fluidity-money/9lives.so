FROM superposition/go-build:latest AS build

FROM golang:1.26rc1-alpine3.23 AS runtime

COPY --from=build /usr/local/src/superposition/cmd/ingestor.ethereum/ingestor.ethereum .

ENTRYPOINT ["./ingestor.ethereum"]
