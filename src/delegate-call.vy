#!/usr/bin/env vyper

# @version >=0.4.0

def delegate(a: address):
	raw_call(a, msg.data, is_delegate_call=True)

@external
def __default__():
	if convert(slice(msg.data, 2, 1), uint8) == 1:
		self.delegate(0x1000000000000000000000000000000000000001)
	else:
		self.delegate(0x2000000000000000000000000000000000000002)
