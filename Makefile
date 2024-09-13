
CARGO_BUILD_STYLUS := \
	cargo build \
		-Z build-std=std,panic_abort \
		-Z build-std-features=panic_immediate_abort \
		-Z unstable-options \
		--release \
		--target wasm32-unknown-unknown \
		--artifact-dir . \
		--features

.PHONY: build clean docs

OUT_SHARE := out/Share.sol/Share.json

build: ${OUT_SHARE} factory.wasm trading.wasm

${OUT_SHARE}: $(shell find src -name '*.sol')
	@forge build

factory.wasm: $(shell find src -type f -name '*.rs')
	@rm -f factory.wasm
	@${CARGO_BUILD_STYLUS} factory,testing
	@mv ninelives.wasm factory.wasm
	@rm liblib9lives.rlib

trading.wasm: $(shell find src -type f -name '*.rs')
	@rm -f trading.wasm
	@${CARGO_BUILD_STYLUS} trading,testing
	@mv ninelives.wasm trading.wasm
	@rm liblib9lives.rlib

clean:
	@rm -f ninelives.wasm factory.wasm trading.wasm target liblib9lives.rlib
