package types

type (
	Campaign struct {
		// Name of the campaign.
		Name string `json:"name"`

		// Description of the campaign in simple text.
		Description string `json:"description"`

		// Creator of the campaign.
		Creator *Wallet `json:"creator"`

		// Oracle that can decide if a winner happened.
		Oracle string `json:"oracle"`

		// Identifier that's used to do offline derivation of the campaign pool,
		// and the outcome shares. Is keccak256(name . description . seed)[:8].
		Identifier string `json:"identifier"`

		// Pool address to purchase shares, and to receive the cost function.
		PoolAddress string `json:"poolAddress"`

		// Outcomes associated with this campaign.
		Outcomes []Outcome `json:"outcomes"`
	}

	Outcome struct {
		// Campaign this outcome is associated with.
		Campaign *Campaign `json:"campaign"`

		// Name of this campaign.
		Name string `json:"name"`

		// Text description of this campaign.
		Description string `json:"description"`

		// Address of the creator.
		Creator *Wallet `json:"creator"`

		// Identifier hex encoded associated with this outcome. Used to derive addresses.
		// Is of the form keccak256(name . description . seed)[:8]
		Identifier string `json:"identifier"`

		// Share address to trade this outcome.
		Share *Share `json:"share"`
	}

	// Share representing the outcome of the current amount.
	Share struct {
		// ERC20 address of this campaign.
		Address string `json:"address"`
	}

	// Wallet of the creator of a campaign.
	Wallet struct {
		// Wallet address of this wallet, in hex.
		Address string `json:"address"`
	}
)

type Frontpage struct {
	Campaigns []Campaign `json:"campaigns"`
}
