package main

import "testing"

func TestTmpl(t *testing.T) {
	a := make([]any, 10)
	t.Logf("template: %v", formatSql("Table", []string{"Hello", "World"}, "Hello", a...))
}
