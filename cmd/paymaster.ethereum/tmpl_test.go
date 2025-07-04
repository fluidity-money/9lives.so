package main

import (
	"testing"
	"database/sql"
)

func TestGenIds(t *testing.T) {
	t.Log(GenLogIds(
		LogId{0, true, sql.NullString{"", true}},
		LogId{1, false, sql.NullString{"swag", true}},
	))
	t.Fail()
}
