
comma=,
CARGO_EXTRA_FEATURES := \
	$(if ${SPN_HARNESS_BACKEND},${comma}harness-stylus-interpreter)
CARGO_EXTRA_FEATURES := \
	$(if ${SPN_ADJUST_TIME},${comma}e2e-adjust-time)${CARGO_EXTRA_FEATURES}

CARGO_BUILD_STYLUS := \
	cargo build \
		--release \
		--target wasm32-unknown-unknown \
		--features

RELEASE_WASM_POST := ./wasm-post.sh

.PHONY: build clean docs factory trading solidity

OUT_SHARE := out/Share.sol/Share.json

build: \
	${OUT_SHARE} \
	contract-factory-1 \
	contract-factory-2 \
	contract-trading-dppm-mint \
	contract-trading-dppm-extras \
	contract-trading-dppm-quotes \
	contract-trading-dppm-price \
	contract-trading-amm-mint \
	contract-trading-amm-extras \
	contract-trading-amm-quotes \
	contract-trading-amm-price \
	contract-lockup \
	contract-infra-market \
	contract-beauty-contest \
	contract-infra-market-testing

solidity: ${OUT_SHARE}

coverage: ${OUT_COVERAGE}

${OUT_SHARE}: $(shell find src tests -name '*.sol')
	@>&2 forge build --silent

OUT_COVERAGE := coverage-out/index.html

contract-factory-1: contract-factory-1.wasm
contract-factory-2: contract-factory-2.wasm

contract-trading-dppm-mint: contract-trading-dppm-mint.wasm
contract-trading-dppm-extras: contract-trading-dppm-extras.wasm
contract-trading-dppm-quotes: contract-trading-dppm-quotes.wasm
contract-trading-dppm-price: contract-trading-dppm-price.wasm

contract-trading-amm-mint: contract-trading-amm-mint.wasm
contract-trading-amm-extras: contract-trading-amm-extras.wasm
contract-trading-amm-quotes: contract-trading-amm-quotes.wasm
contract-trading-amm-price: contract-trading-amm-price.wasm

contract-trading-amm-extras-admin: contract-trading-amm-extras-admin.wasm

contract-lockup: contract-lockup.wasm

contract-infra-market: contract-infra-market.wasm

contract-beauty-contest: contract-beauty-contest.wasm

contract-infra-market-testing: contract-infra-market-testing.wasm

contract-factory-1.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-factory-1.wasm
	@${CARGO_BUILD_STYLUS} contract-factory-1${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-factory-1.wasm

contract-factory-2.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-factory-2.wasm
	@${CARGO_BUILD_STYLUS} contract-factory-2${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-factory-2.wasm

contract-trading-dppm-mint.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-mint.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-mint,trading-backend-dppm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-dppm-mint.wasm

contract-trading-dppm-extras.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-extras.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-extras,trading-backend-dppm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-dppm-extras.wasm

contract-trading-dppm-quotes.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-quotes.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-quotes,trading-backend-dppm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-dppm-quotes.wasm

contract-trading-dppm-price.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-price.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-price,trading-backend-dppm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-dppm-price.wasm

contract-trading-amm-mint.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-mint.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-mint,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-amm-mint.wasm

contract-trading-amm-extras.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-extras.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-extras,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-amm-extras.wasm

contract-trading-amm-quotes.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-quotes.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-quotes,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-amm-quotes.wasm

contract-trading-amm-price.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-price.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-price,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-amm-price.wasm

contract-lockup.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-lockup.wasm
	@${CARGO_BUILD_STYLUS} contract-lockup${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-lockup.wasm

contract-infra-market.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-infra-market.wasm
	@${CARGO_BUILD_STYLUS} contract-infra-market${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-infra-market.wasm

contract-beauty-contest.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-beauty-contest.wasm
	@${CARGO_BUILD_STYLUS} contract-beauty-contest${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-beauty-contest.wasm

contract-infra-market-testing.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-infra-market-testing.wasm
	@${CARGO_BUILD_STYLUS} contract-infra-market-testing${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-infra-market-testing.wasm

contract-trading-amm-extras-admin.wasm: $(shell find src -type f -name '*.rs')
	@rm -f contract-trading-amm-extras-admin.wasm
	@${CARGO_BUILD_STYLUS} contract-trading-extras-admin,trading-backend-amm${CARGO_EXTRA_FEATURES}
	@${RELEASE_WASM_POST} contract-trading-amm-extras-admin.wasm

clean:
	@rm -rf \
		contract-beauty-contest.wasm \
		contract-factory-1.wasm \
		contract-factory-2.wasm \
		contract-infra-market.wasm \
		contract-lockup.wasm \
		contract-trading-amm-extras.wasm \
		contract-trading-amm-extras-admin.wasm \
		contract-trading-amm-mint.wasm \
		contract-trading-dppm-extras.wasm \
		contract-trading-dppm-mint.wasm \
		contract-trading-dppm-trading-extras.wasm \
		contract-trading-dppm-trading-mint.wasm \
		contract-infra-market-testing.wasm \
		contract-beauty-contest.wasm.wasm-opt \
		contract-factory-1.wasm.wasm-opt \
		contract-factory-2.wasm.wasm-opt \
		contract-infra-market.wasm.wasm-opt \
		contract-lockup.wasm.wasm-opt \
		contract-trading-amm-extras.wasm.wasm-opt \
		contract-trading-amm-extras-admin.wasm.wasm-opt \
		contract-trading-amm-mint.wasm.wasm-opt \
		contract-trading-dppm-extras.wasm.wasm-opt \
		contract-trading-dppm-mint.wasm.wasm-opt \
		contract-trading-dppm-trading-extras.wasm.wasm-opt \
		contract-trading-dppm-trading-mint.wasm.wasm-opt \
		contract-infra-market-testing.wasm.wasm-opt \
		contract-beauty-contest.wasm.wat \
		contract-factory-1.wasm.wat \
		contract-factory-2.wasm.wat \
		contract-infra-market.wasm.wat \
		contract-lockup.wasm.wat \
		contract-trading-amm-extras.wasm.wat \
		contract-trading-amm-extras-admin.wasm.wat \
		contract-trading-amm-mint.wasm.wat \
		contract-trading-dppm-extras.wasm.wat \
		contract-trading-dppm-mint.wasm.wat \
		contract-trading-dppm-trading-extras.wasm.wat \
		contract-trading-dppm-trading-mint.wasm.wat \
		contract-infra-market-testing.wasm.wat \
		liblib9lives.rlib \
		ninelives.wasm \
		target
