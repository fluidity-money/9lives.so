package main

import "testing"

func TestPartitionedBufferOrderBeforeWrap(t *testing.T) {
	pb := newPartitionedBuffer()
	for j := 0; j < 10; j++ {
		pb.insert("BTC", map[string]any{"seq": j})
	}
	items := pb.allItems()
	if len(items) != 10 {
		t.Fatalf("expected 10 items, got %d", len(items))
	}
	for j, item := range items {
		if item["seq"] != j {
			t.Fatalf("item %d out of order: got seq %v", j, item["seq"])
		}
	}
}

func TestPartitionedBufferOrderAfterWrap(t *testing.T) {
	pb := newPartitionedBuffer()
	total := PrivateSnapshotLookback + 500
	for j := 0; j < total; j++ {
		pb.insert("BTC", map[string]any{"seq": j})
	}
	items := pb.allItems()
	if len(items) != PrivateSnapshotLookback {
		t.Fatalf("expected %d items, got %d", PrivateSnapshotLookback, len(items))
	}
	first := total - PrivateSnapshotLookback
	for j, item := range items {
		if item["seq"] != first+j {
			t.Fatalf("item %d out of order: got seq %v, want %d", j, item["seq"], first+j)
		}
	}
}

func TestPartitionedBufferOrderAtExactCapacity(t *testing.T) {
	pb := newPartitionedBuffer()
	for j := 0; j < PrivateSnapshotLookback; j++ {
		pb.insert("BTC", map[string]any{"seq": j})
	}
	items := pb.allItems()
	if len(items) != PrivateSnapshotLookback {
		t.Fatalf("expected %d items, got %d", PrivateSnapshotLookback, len(items))
	}
	for j, item := range items {
		if item["seq"] != j {
			t.Fatalf("item %d out of order: got seq %v", j, item["seq"])
		}
	}
}
