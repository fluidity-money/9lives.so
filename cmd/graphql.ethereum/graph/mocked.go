package graph

import (
	"time"

	"github.com/fluidity-money/9lives.so/lib/types"
)

func MockGraphCampaigns() []types.Campaign {
	mockItem := types.Campaign{
		ID:        "0x1234678",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Content: types.CampaignContent{
			Name: "USA Election Winner 2024",
			Description: `
The 2024 United States presidential election will be the 60th quadrennial presidential election, set to be held on Tuesday, November 5, 2024.[1] Voters in each state and the District of Columbia will choose electors to the Electoral College, who will then elect a president and vice president for a term of four years.`,
			Creator: &types.Wallet{
				Address: "0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5",
			},
			Seed:        123,
			Oracle:      "0x6221a9c005f6e47eb398fd867784cacfdcfff4e7",
			PoolAddress: "0x0000000000000000000000000000000000000000",
			Outcomes: []types.Outcome{
				{Name: "Kamala Harris", Description: "s", Seed: 12, Identifier: "0x59303e9e", Share: &types.Share{Address: "0x0000000000000000000000000000000000000000"}},
				{Name: "Donald Trump", Description: "d", Seed: 13, Identifier: "0x46647bf6", Share: &types.Share{Address: "0x0000000000000000000000000000000000000000"}},
				{Name: "Shahmeer Chaudhry", Description: "t", Seed: 14, Identifier: "0x233a1b30", Share: &types.Share{Address: "0x0000000000000000000000000000000000000000"}},
				{Name: "Michelle Obama", Description: "c", Seed: 15, Identifier: "0x2b48de91", Share: &types.Share{Address: "0x0000000000000000000000000000000000000000"}},
			},
		}}
	var list = make([]types.Campaign, 1)
	list[0] = mockItem
	return list
}
