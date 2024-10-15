
CARGO_BUILD_STYLUS := \
	cargo build \
		--release \
		--target wasm32-unknown-unknown \
		--features

RELEASE_WASM_OPT_9LIVES := \
	wasm-opt \
		--dce \
		--rse \
		--signature-pruning \
		-Os target/wasm32-unknown-unknown/release/ninelives.wasm \
		-o

.PHONY: build clean docs factory trading

OUT_SHARE := out/Share.sol/Share.json

build: ${OUT_SHARE} factory.wasm trading.wasm

${OUT_SHARE}: $(shell find src -name '*.sol')
	@forge build

factory: factory.wasm
trading: trading.wasm

factory.wasm: $(shell find src -type f -name '*.rs')
	@rm -f factory.wasm
	@${CARGO_BUILD_STYLUS} factory
	@${RELEASE_WASM_OPT_9LIVES} factory.wasm

trading.wasm: $(shell find src -type f -name '*.rs')
	@rm -f trading.wasm
	@${CARGO_BUILD_STYLUS} trading
	@${RELEASE_WASM_OPT_9LIVES} trading.wasm

clean:
	@rm -rf ninelives.wasm factory.wasm trading.wasm target liblib9lives.rlib
