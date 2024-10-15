#!/usr/bin/env vyper

# @version >=0.4.0

def delegate(a: address):
	raw_call(a, msg.data, is_delegate_call=True)

@external
def __default__():
	if convert(slice(msg.data, 2, 1), uint8) == 2:
		self.delegate(0xFF02930eF3774686b587C9641112ce91E93aBF8a)
	else:
		self.delegate(0xa4c0b4bF1331944Ac4dc98C4305F9CC603ce2EaE)
