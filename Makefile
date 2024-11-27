
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

build: \
	${OUT_SHARE} \
	contract-factory-1 \
	contract-factory-2 \
	contract-trading-trading-mint \
	contract-trading-trading-extras \
	contract-lockup \
	contract-infrastructure-market

solidity: ${OUT_SHARE}

${OUT_SHARE}: $(shell find src tests -name '*.sol')
	@forge build

contract-factory-1: contract-factory-1.wasm
contract-factory-2: contract-factory-2.wasm

contract-trading-trading-mint: contract-trading-trading-mint.wasm
contract-trading-trading-extras: contract-trading-trading-extras.wasm

contract-lockup: contract-lockup.wasm

contract-infrastructure-market: contract-infrastructure-market.wasm

contract-oracle-state: contract-oracle-state.wasm

contract-factory-1.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-factory-1.wasm
	@${CARGO_BUILD_STYLUS} contract-factory-1
	@${RELEASE_WASM_OPT_9LIVES} contract-factory-1.wasm

contract-factory-2.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-factory-2.wasm
	@${CARGO_BUILD_STYLUS} contract-factory-2
	@${RELEASE_WASM_OPT_9LIVES} contract-factory-2.wasm

contract-trading-trading-mint.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-trading-mint.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-trading-mint
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-trading-mint.wasm

contract-trading-trading-extras.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-trading-extras.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-trading-extras
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-trading-extras.wasm

contract-lockup.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-lockup.wasm
	@${CARGO_BUILD_STYLUS} contract-lockup
	@${RELEASE_WASM_OPT_9LIVES} contract-lockup.wasm

contract-infrastructure-market.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-infrastructure-market.wasm
	@${CARGO_BUILD_STYLUS} contract-infrastructure-market
	@${RELEASE_WASM_OPT_9LIVES} contract-infrastructure-market.wasm

clean:
	@rm -rf \
		ninelives.wasm \
		factory.wasm \
		contract-trading-trading-mint.wasm \
		contract-trading-trading-extras.wasm \
		target \
		liblib9lives.rlib
