
CARGO_BUILD_STYLUS := \
	cargo build \
		-Z build-std=std,panic_abort \
		-Z build-std-features=panic_immediate_abort \
		-Z unstable-options \
		--release \
		--target wasm32-unknown-unknown \
		--artifact-dir . \
		--features

.PHONY: build clean

build: factory.wasm trading.wasm

factory.wasm: $(shell find src -type f -name '*.rs')
	@${CARGO_BUILD_STYLUS} factory
	@mv ninelives.wasm factory.wasm
	@rm liblib9lives.rlib

trading.wasm: $(shell find src -type f -name '*.rs')
	@${CARGO_BUILD_STYLUS} trading
	@mv ninelives.wasm trading.wasm
	@rm liblib9lives.rlib

clean:
	@rm -f ninelives.wasm factory.wasm trading.wasm target liblib9lives.rlib
