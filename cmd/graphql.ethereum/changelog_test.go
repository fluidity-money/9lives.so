package main

import "testing"

func TestChangelog(t *testing.T) {
	if len(Changelog) == 0 {
		t.Fail()
	}
}
