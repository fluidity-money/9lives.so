package graph

import "github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph/model"

func MockGraphCampaigns() ([]model.Campaign, error) {
	return []model.Campaign{{
		Name: "USA Election Winner 2024",
		Description: `
The 2024 United States presidential election will be the 60th quadrennial presidential election, set to be held on Tuesday, November 5, 2024.[1] Voters in each state and the District of Columbia will choose electors to the Electoral College, who will then elect a president and vice president for a term of four years.`,
		Creator: &model.Wallet{
			Address: "0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5",
		},
		Oracle:      "0x6221a9c005f6e47eb398fd867784cacfdcfff4e7",
		Identifier:  "0x05092150",
		PoolAddress: "0x0000000000000000000000000000000000000000",
		Outcomes: []model.Outcome{
			{nil, "Kamala Harris", "", &model.Wallet{"0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"}, "0x59303e9e", &model.Share{"0x0000000000000000000000000000000000000000"}},
			{nil, "Donald Trump", "", &model.Wallet{"0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"}, "0x46647bf6", &model.Share{"0x0000000000000000000000000000000000000000"}},
			{nil, "Shahmeer Chaudhry", "", &model.Wallet{"0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"}, "0x233a1b30", &model.Share{"0x0000000000000000000000000000000000000000"}},
			{nil, "Michelle Obama", "", &model.Wallet{"0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"}, "0x2b48de91", &model.Share{"0x0000000000000000000000000000000000000000"}},
		},
	}}, nil
}
