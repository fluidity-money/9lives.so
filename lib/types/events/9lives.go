package events

type (
	// EventNewTrading event emitted by the factory.
	EventNewTrading struct {
		Event

		Identifier Bytes   `json:"identifier"`
		Addr       Address `json:"address" gorm:"address"`
		Oracle     Address `json:"oracle"`
	}

	// EventOutcomeCreated by a factory for a trading instance.
	EventOutcomeCreated struct {
		Event

		TradingIdentifier Bytes   `json:"trading_identifier"`
		Erc20Identifier   Bytes   `json:"erc20_identifier"`
		Erc20Addr         Address `json:"erc20_addr"`
	}

	// EventOutcomeDecided using the decide function on a campaign and outcome.
	// Emitted by a trading instance.
	EventOutcomeDecided struct {
		Event

		Identifier Bytes   `json:"identifier"`
		Oracle     Address `json:"oracle"`
	}

	EventSharesMinted struct {
		Event

		Identifier  Bytes   `json:"identifier"`
		ShareAmount Number  `json:"share_amount"`
		Spender     Address `json:"spender"`
		Recipient   Address `json:"recipient"`
		FusdcSpent  Number `json:"fusdc_spent"`
	}

	EventPayoffActivated struct {
		Event

		Identifier    Bytes   `json:"identifier"`
		SharesSpent   Number  `json:"shares_spent"`
		Spender       Address `json:"spender"`
		Recipient     Address `json:"recipient"`
		FusdcReceived Number `json:"fusdc_received"`
	}
)
