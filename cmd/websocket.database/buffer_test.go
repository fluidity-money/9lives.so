package main

import (
	"encoding/json"
	"testing"
	"time"
)

// The compact priceRow must marshal to exactly the JSON shape of the
// decoded map it replaces, so snapshot payloads are unchanged.
func TestCompactPriceRowSameJSON(t *testing.T) {
	created := time.Date(2026, 7, 9, 10, 0, 0, 123456000, time.UTC)
	m := map[string]any{
		"id":         int64(42),
		"base":       "BTC",
		"amount":     62000.5,
		"created_by": created,
	}
	row := compactPriceRow(m)
	if _, ok := row.(priceRow); !ok {
		t.Fatalf("expected compact form, got %T", row)
	}
	got, err := json.Marshal(row)
	if err != nil {
		t.Fatalf("marshal compact: %v", err)
	}
	want, err := json.Marshal(m)
	if err != nil {
		t.Fatalf("marshal map: %v", err)
	}
	var gotV, wantV map[string]any
	if err := json.Unmarshal(got, &gotV); err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(want, &wantV); err != nil {
		t.Fatal(err)
	}
	for k, w := range wantV {
		if g, ok := gotV[k]; !ok || g != w {
			t.Fatalf("field %q: compact %v, map %v", k, gotV[k], w)
		}
	}
	if len(gotV) != len(wantV) {
		t.Fatalf("field count differs: compact %d, map %d", len(gotV), len(wantV))
	}
}

// Unexpected decoded types must fall back to the map unchanged.
func TestCompactPriceRowFallback(t *testing.T) {
	m := map[string]any{"id": "not-an-int", "base": "BTC", "amount": 1.0, "created_by": time.Now()}
	if _, ok := compactPriceRow(m).(map[string]any); !ok {
		t.Fatal("expected fallback to the original map")
	}
}

// itemField must read both retained forms identically.
func TestItemField(t *testing.T) {
	row := priceRow{Id: 7, Base: "BTC", Amount: 1.5, CreatedBy: time.Unix(100, 0)}
	m := map[string]any{"id": int64(7), "base": "BTC", "amount": 1.5, "created_by": time.Unix(100, 0)}
	for _, k := range []string{"id", "base", "amount", "created_by"} {
		rv, rok := itemField(row, k)
		mv, mok := itemField(m, k)
		if !rok || !mok {
			t.Fatalf("field %q missing: row %v, map %v", k, rok, mok)
		}
		if rv != mv {
			t.Fatalf("field %q differs: row %v, map %v", k, rv, mv)
		}
	}
	if _, ok := itemField(row, "nope"); ok {
		t.Fatal("unknown field must not resolve")
	}
}
