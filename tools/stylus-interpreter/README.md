
# Stylus Interpreter (sid)

The Stylus Interpreter is a f contract runner that runs the WASM contract that's provided
as arguments, using state override calls to run calls on-chain on behalf of the user. It
provides extra features to support providing extra info to the environment, and has no
codesize restrictions for testing.

It can optionally run a test suite using decorators, and these will persist internally the
state overrides from testing, so it can function similar to a forknet testing environment
a la Hardhat.

## Example usage

