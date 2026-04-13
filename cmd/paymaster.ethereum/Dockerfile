FROM superposition/go-build:latest AS build

RUN /usr/local/src/superposition/cmd/paymaster.ethereum && \
	go build

FROM golang:1.26rc1-alpine3.23 AS runtime

COPY --from=build /usr/local/src/superposition/cmd/paymaster.ethereum/paymaster.ethereum .

ENTRYPOINT ["./paymaster.ethereum"]
