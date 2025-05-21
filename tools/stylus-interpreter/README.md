
# Stylus Interpreter (sid)

The Stylus Interpreter is a configurable wasm runner that lets you override local state,
simulate calls and persist the output, and more! It currently only supports CREATE1, some
standard operations, and calls without static call.

It has a few custom functions you can use to log interesting output. This simplifies
testing! Be warned that this is a hacked together codebase, and is extremely messy and
written without care!

## State overriding

It's possible to override storage slots using the `--state-override` function is set from
stdin! If the address 0x0000000000000000000000000000000000000000 is used, it'll override
for the current contract that's in use, or you can specify the address to anything other than
zero to use a different location.

Any Xs in the string will be replaced with a random byte. This can be useful for fuzzing
program state with repeated invocation with the same input.

{
	"<ADDRESS OF THE CONTRACT>":  {
		"<SLOT TO OVERRIDE>": "<VALUE TO OVERRIDE>"
	}
}
