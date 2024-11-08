
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
		--strip-debug \
		--strip-producers \
		-Oz target/wasm32-unknown-unknown/release/ninelives.wasm \
		-o

.PHONY: build clean docs factory trading solidity

OUT_SHARE := out/Share.sol/Share.json

build: ${OUT_SHARE} factory-1 factory-2 trading-mint trading-extras

solidity: ${OUT_SHARE}

${OUT_SHARE}: $(shell find src tests -name '*.sol')
	@forge build

factory-1: factory-1.wasm
factory-2: factory-2.wasm

trading-mint: trading-mint.wasm
trading-extras: trading-extras.wasm

infra-pool: infra-pool.wasm

factory-1.wasm: $(shell find src -type f -name '*.rs')
	@rm -f factory-1.wasm
	@${CARGO_BUILD_STYLUS} amm-use-camelot,factory-1
	@${RELEASE_WASM_OPT_9LIVES} factory-1.wasm

factory-2.wasm: $(shell find src -type f -name '*.rs')
	@rm -f factory-2.wasm
	@${CARGO_BUILD_STYLUS} amm-use-camelot,factory-2
	@${RELEASE_WASM_OPT_9LIVES} factory-2.wasm

trading-mint.wasm: $(shell find src -type f -name '*.rs')
	@rm -f trading-mint.wasm
	@${CARGO_BUILD_STYLUS} amm-use-camelot,trading-mint
	@${RELEASE_WASM_OPT_9LIVES} trading-mint.wasm

trading-extras.wasm: $(shell find src -type f -name '*.rs')
	@rm -f trading-extras.wasm
	@${CARGO_BUILD_STYLUS} amm-use-camelot,trading-extras
	@${RELEASE_WASM_OPT_9LIVES} trading-extras.wasm

infra-pool.wasm: $(shell find src -type f -name '*.rs')
	@rm -f infra-pool.wasm
	@${CARGO_BUILD_STYLUS} amm-use-camelot,infra-pool-wasm
	@${RELEASE_WASM_OPT_9LIVES} infra-pool.wasm

clean:
	@rm -rf \
		ninelives.wasm \
		factory.wasm \
		trading-mint.wasm \
		trading-extras.wasm \
		target \
		liblib9lives.rlib
