
CARGO_BUILD_STYLUS := \

.PHONY: build clean

build: ninelives.wasm

ninelives.wasm: $(shell find src -type f -name '*.rs')
	@cargo build \
		-Z build-std=std,panic_abort \
		-Z build-std-features=panic_immediate_abort \
		-Z unstable-options \
		--release \
		--target wasm32-unknown-unknown \
		--artifact-dir .
	@rm liblib9lives.rlib

clean:
	@rm -r ninelives.wasm target liblib9lives.rlib
