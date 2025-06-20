package main

import "testing"

func TestGenIds(t *testing.T) {
	t.Log(GenLogIds(
		LogId{0, true},
		LogId{1, false},
	))
	t.Fail()
}
