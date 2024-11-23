
EXTRA_FILES := CHANGELOG.md

include ../golang.mk

.PHONY: lambda

build: graphql.ethereum

lambda: bootstrap.zip

CHANGELOG.md: ../../CHANGELOG.md
	@cp ../../CHANGELOG.md CHANGELOG.md

bootstrap: graphql.ethereum
	@cp graphql.ethereum bootstrap

bootstrap.zip: bootstrap
	@zip bootstrap.zip bootstrap
