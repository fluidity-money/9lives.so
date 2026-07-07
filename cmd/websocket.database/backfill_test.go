package main

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"
)

// TestLoadRecentPrices runs against a real database when
// SPN_TEST_TIMESCALE_URL is set, and is skipped otherwise. The table
// must contain rows for at least one base.
func TestLoadRecentPrices(t *testing.T) {
	url := os.Getenv("SPN_TEST_TIMESCALE_URL")
	if url == "" {
		t.Skip("SPN_TEST_TIMESCALE_URL not set")
	}
	rows, err := loadRecentPrices(context.Background(), url)
	if err != nil {
		t.Fatalf("loadRecentPrices: %v", err)
	}
	if len(rows) == 0 {
		t.Fatal("no rows returned")
	}
	perBase := make(map[string]int)
	lastPerBase := make(map[string]time.Time)
	for i, row := range rows {
		base, ok := row["base"].(string)
		if !ok {
			t.Fatalf("row %d: base is %T", i, row["base"])
		}
		if _, ok := row["id"].(int64); !ok {
			t.Fatalf("row %d: id is %T", i, row["id"])
		}
		if _, ok := row["amount"].(float64); !ok {
			t.Fatalf("row %d: amount is %T", i, row["amount"])
		}
		createdBy, ok := row["created_by"].(time.Time)
		if !ok {
			t.Fatalf("row %d: created_by is %T", i, row["created_by"])
		}
		if last, seen := lastPerBase[base]; seen && createdBy.Before(last) {
			t.Fatalf("row %d: base %s out of order: %v before %v",
				i, base, createdBy, last)
		}
		lastPerBase[base] = createdBy
		perBase[base]++
	}
	for base, n := range perBase {
		if n > PrivateSnapshotLookback {
			t.Fatalf("base %s exceeds lookback cap: %d rows", base, n)
		}
	}
	fmt.Printf("rows per base: %v\n", perBase)
}
