package main

import cdcPublication "github.com/Trendyol/go-pq-cdc/pq/publication"

var tables = map[string][]string{
	"ninelives_buys_and_sells_1": {
		"shown",
		"block_hash",
		"emitter_addr",
		"outcome_id",
		"recipient",
		"spender",
		"transaction_hash",
		"from_symbol",
		"to_symbol",
		"type",
		"block_number",
		"campaign_content",
		"from_amount",
		"to_amount",
		"total_volume",
		"campaign_id",
		"created_by",
	},
	"ninelives_campaigns_1": {
		"shown",
		"content",
		"total_volume",
		"id",
		"name_to_search",
		"created_at",
		"updated_at",
	},
	"ninelives_comments_1": {
		"wallet_address",
		"campaign_id",
		"content",
		"created_at",
	},
	"oracles_ninelives_prices_2": {
		"base",
		"id",
		"amount",
		"created_by",
	},
	"ninelives_events_outcome_decided": {
		"id",
		"created_by",
		"block_hash",
		"transaction_hash",
		"block_number",
		"emitter_addr",
		"identifier",
		"oracle",
	},
}

func getTables() (t cdcPublication.Tables) {
	t = make(cdcPublication.Tables, len(tables))
	i := 0
	for n := range tables {
		t[i] = cdcPublication.Table{
			Name:            n,
			ReplicaIdentity: cdcPublication.ReplicaIdentityFull,
		}
		i++
	}
	return
}

func makeTableFilter() (m map[string]map[string]bool) {
	m = make(map[string]map[string]bool, len(tables))
	for k, vs := range tables {
		if m[k] == nil {
			m[k] = make(map[string]bool, len(vs))
		}
		for _, v := range vs {
			m[k][v] = true
		}
	}
	return
}
