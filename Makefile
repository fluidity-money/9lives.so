
CARGO_BUILD_STYLUS := \
	cargo build \
		--release \
		--target wasm32-unknown-unknown \
		--features ${CARGO_EXTRA_FEATURES},

RELEASE_WASM_OPT_9LIVES := \
	wasm-opt \
		--dce \
		--rse \
		--signature-pruning \
		--strip-debug \
		--strip-producers \
		-Oz target/wasm32-unknown-unknown/release/ninelives.wasm \
		-o

.PHONY: build clean docs factory trading

OUT_SHARE := out/Share.sol/Share.json

build: ${OUT_SHARE} factory trading-mint trading-extras

${OUT_SHARE}: $(shell find src -name '*.sol')
	@forge build

factory: factory.wasm
trading-mint: trading-mint.wasm
trading-extras: trading-extras.wasm

factory.wasm: $(shell find src -type f -name '*.rs')
	@rm -f factory.wasm
	@${CARGO_BUILD_STYLUS}factory
	@${RELEASE_WASM_OPT_9LIVES} factory.wasm

trading-mint.wasm: $(shell find src -type f -name '*.rs')
	@rm -f trading-mint.wasm
	@${CARGO_BUILD_STYLUS}trading-mint
	@${RELEASE_WASM_OPT_9LIVES} trading-mint.wasm

trading-extras.wasm: $(shell find src -type f -name '*.rs')
	@rm -f trading-extras.wasm
	@${CARGO_BUILD_STYLUS}trading-extras
	@${RELEASE_WASM_OPT_9LIVES} trading-extras.wasm

clean:
	@rm -rf ninelives.wasm factory.wasm trading-mint.wasm trading-extras.wasm target liblib9lives.rlib
