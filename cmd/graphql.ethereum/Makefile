
include ../golang.mk

EXTRA_FILES := pools.toml bootstrap bootstrap.zip

.PHONY: lambda

lambda: bootstrap.zip

bootstrap: graphql.ethereum
	@cp graphql.ethereum bootstrap

bootstrap.zip: bootstrap
	@zip bootstrap.zip bootstrap
