
test-contract.wasm: $(shell find src -type f)
	@rm -f test-contract.wasm
	@cargo build --release --target wasm32-unknown-unknown
	@mv target/wasm32-unknown-unknown/release/test-contract.wasm .
