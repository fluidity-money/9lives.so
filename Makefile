
comma=,
CARGO_EXTRA_FEATURES := \
	$(if ${SPN_HARNESS_BACKEND},${comma}harness-stylus-interpreter)

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
	contract-trading-dpm-mint \
	contract-trading-dpm-extras \
	contract-trading-dpm-quotes \
	contract-trading-dpm-price \
	contract-trading-amm-mint \
	contract-trading-amm-extras \
	contract-trading-amm-quotes \
	contract-trading-amm-price \
	contract-lockup \
	contract-infra-market-extras \
	contract-infra-market-predict \
	contract-infra-market-sweep \
	contract-beauty-contest

solidity: ${OUT_SHARE}

coverage: ${OUT_COVERAGE}

${OUT_SHARE}: $(shell find src tests -name '*.sol')
	@>&2 forge build --silent

OUT_COVERAGE := coverage-out/index.html

contract-factory-1: contract-factory-1.wasm
contract-factory-2: contract-factory-2.wasm

contract-trading-dpm-mint: contract-trading-dpm-mint.wasm
contract-trading-dpm-extras: contract-trading-dpm-extras.wasm
contract-trading-dpm-quotes: contract-trading-dpm-quotes.wasm
contract-trading-dpm-price: contract-trading-dpm-price.wasm

contract-trading-amm-mint: contract-trading-amm-mint.wasm
contract-trading-amm-extras: contract-trading-amm-extras.wasm
contract-trading-amm-quotes: contract-trading-amm-quotes.wasm
contract-trading-amm-price: contract-trading-amm-price.wasm

contract-lockup: contract-lockup.wasm

contract-infra-market-predict: contract-infra-market-predict.wasm
contract-infra-market-sweep: contract-infra-market-sweep.wasm
contract-infra-market-extras: contract-infra-market-extras.wasm

contract-beauty-contest: contract-beauty-contest.wasm

contract-factory-1.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-factory-1.wasm
	@${CARGO_BUILD_STYLUS} contract-factory-1${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-factory-1.wasm

contract-factory-2.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-factory-2.wasm
	@${CARGO_BUILD_STYLUS} contract-factory-2${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-factory-2.wasm

contract-trading-dpm-mint.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-mint.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-mint,trading-backend-dpm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-dpm-mint.wasm

contract-trading-dpm-extras.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-extras.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-extras,trading-backend-dpm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-dpm-extras.wasm

contract-trading-dpm-quotes.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-quotes.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-quotes,trading-backend-dpm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-dpm-quotes.wasm

contract-trading-dpm-price.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-price.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-price,trading-backend-dpm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-dpm-price.wasm

contract-trading-amm-mint.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-mint.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-mint,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-amm-mint.wasm

contract-trading-amm-extras.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-extras.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-extras,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-amm-extras.wasm

contract-trading-amm-quotes.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-quotes.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-quotes,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-amm-quotes.wasm

contract-trading-amm-price.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-price.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-price,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-trading-amm-price.wasm

contract-lockup.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-lockup.wasm
	@${CARGO_BUILD_STYLUS} contract-lockup${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-lockup.wasm

contract-infra-market-predict.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-infra-market-predict.wasm
	@${CARGO_BUILD_STYLUS} contract-infra-market-predict${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-infra-market-predict.wasm

contract-infra-market-sweep.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-infra-market-sweep.wasm
	@${CARGO_BUILD_STYLUS} contract-infra-market-sweep${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-infra-market-sweep.wasm

contract-infra-market-extras.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-infra-market-extras.wasm
	@${CARGO_BUILD_STYLUS} contract-infra-market-extras${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-infra-market-extras.wasm

contract-beauty-contest.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-beauty-contest.wasm
	@${CARGO_BUILD_STYLUS} contract-beauty-contest${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_OPT_9LIVES} contract-beauty-contest.wasm

clean:
	@rm -rf \
		contract-beauty-contest.wasm \
		contract-factory-1.wasm \
		contract-factory-2.wasm \
		contract-infra-market-extras.wasm \
		contract-infra-market-predict.wasm \
		contract-infra-market-sweep.wasm \
		contract-lockup.wasm \
		contract-trading-amm-extras.wasm \
		contract-trading-amm-mint.wasm \
		contract-trading-dpm-extras.wasm \
		contract-trading-dpm-mint.wasm \
		contract-trading-dpm-trading-extras.wasm \
		contract-trading-dpm-trading-mint.wasm \
		factory-2.wasm \
		factory-extras-.wasm \
		liblib9lives.rlib \
		ninelives.wasm \
		target \
		trading-extras.wasm \
		trading-mint.wasm
