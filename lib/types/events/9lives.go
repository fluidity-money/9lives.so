package events

import "time"

type (
	// EventNewTrading2 event emitted by the factory.
	EventNewTrading2 struct {
		Event

		Identifier Bytes   `json:"identifier"`
		Addr       Address `json:"address" gorm:"column:address"`
		Oracle     Address `json:"oracle"`
		Backend    uint8   `json:"backend"`
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
		FusdcSpent  Number  `json:"fusdc_spent"`
	}

	EventSharesBurned struct {
		Event

		Identifier    Bytes   `json:"identifier"`
		ShareAmount   Number  `json:"share_amount"`
		Spender       Address `json:"spender"`
		Recipient     Address `json:"recipient"`
		FusdcReturned Number  `json:"fusdc_spent"`
	}

	EventPayoffActivated struct {
		Event

		Identifier    Bytes   `json:"identifier"`
		SharesSpent   Number  `json:"shares_spent"`
		Spender       Address `json:"spender"`
		Recipient     Address `json:"recipient"`
		FusdcReceived Number  `json:"fusdc_received"`
	}

	EventDeadlineExtension struct {
		Event

		TimeBefore time.Time `json:"time_before"`
		TimeAfter  time.Time `json:"time_after"`
	}

	EventMarketCreated2 struct {
		Event

		IncentiveSender Address   `json:"incentive_sender"`
		TradingAddr     Address   `json:"trading_addr"`
		Desc            Bytes     `json:"desc" gorm:"column:desc_"`
		LaunchTs        time.Time `json:"launch_ts"`
		CallDeadline    uint64    `json:"call_deadline"`
	}

	EventCallMade struct {
		Event

		TradingAddr        Address `json:"trading_addr"`
		Winner             Bytes   `json:"winner"`
		IncentiveRecipient Address `json:"incentive_recipient"`
	}

	EventInfraMarketClosed struct {
		Event

		IncentiveRecipient Address `json:"incentive_recipient"`
		TradingAddr        Address `json:"trading_addr"`
		Winner             Bytes   `json:"winner"`
	}

	EventDAOMoneyDistributed struct {
		Event

		Amount    Number  `json:"amount"`
		Recipient Address `json:"recipient"`
	}

	EventCommitted struct {
		Event

		Trading    Address `json:"trading"`
		Predictor  Address `json:"predictor"`
		Commitment Bytes   `json:"commitment"`
	}

	EventCommitmentRevealed struct {
		Event

		Trading  Address `json:"trading"`
		Revealer Address `json:"revealer"`
		Outcome  Bytes   `json:"outcome"`
		Caller   Address `json:"caller"`
		Bal      Number  `json:"bal"`
	}

	EventWhinged struct {
		Event

		TradingAddr      Address `json:"trading_addr"`
		PreferredOutcome Bytes   `json:"preferred_outcome"`
		Whinger          Address `json:"whinger"`
	}

	EventCampaignEscaped struct {
		Event

		TradingAddr Address `json:"trading_addr"`
	}

	EventDeclared struct {
		Event

		TradingAddr    Address `json:"trading_addr"`
		WinningOutcome Bytes   `json:"winning_outcome"`
		FeeRecipient   Address `json:"fee_recipient"`
	}

	EventLockedUp struct {
		Event

		Amount    Number  `json:"amount"`
		Recipient Address `json:"recipient"`
	}

	EventWithdrew struct {
		Event

		Amount    Number  `json:"amount"`
		Recipient Address `json:"recipient"`
	}

	EventSlashed struct {
		Event

		Victim        Address `json:"victim"`
		Recipient     Address `json:"recipient"`
		SlashedAmount Number  `json:"slashed_amount"`
	}

	EventFrozen struct {
		Event

		Victim Address   `json:"victim"`
		Until  time.Time `json:"until"`
	}

	EventRequested struct {
		Event

		Trading Address `json:"trading"`
		Ticket  Number  `json:"ticket"`
	}

	EventConcluded struct {
		Event

		Ticket        Number `json:"ticket"`
		Justification Bytes  `json:"justification"`
	}

	EventLiquidityAdded struct {
		Event

		Sender          Address `json:"sender"`
		FusdcAmt        Number  `json:"fusdc_amt"`
		Recipient       Address `json:"recipient"`
		LiquidityShares Number  `json:"liquidity_shares"`
	}

	EventLiquidityAddedSharesSent struct {
		Event

		Outcome         Bytes   `json:"outcome"`
		LiquidityShares Number  `json:"liquidity_shares"`
		Recipient       Address `json:"recipient"`
	}

	EventLiquidityRemoved struct {
		Event

		FusdcAmt     Number  `json:"fusdc_amt"`
		Recipient    Address `json:"recipient"`
		LiquidityAmt Number  `json:"liquidity_amt"`
	}

	EventLiquidityRemovedSharesSent struct {
		Event

		Outcome   Bytes   `json:"outcome"`
		Recipient Address `json:"recipient"`
		Amount    Number  `json:"amount"`
	}

	EventLiquidityClaimed struct {
		Event

		Recipient Address `json:"recipient"`
		FusdcAmt  Number  `json:"fusdc_amt"`
	}

	EventLPFeesClaimed struct {
		Event

		Sender                Address `json:"sender"`
		Recipient             Address `json:"recipient"`
		FeesEarned            Number  `json:"fees_earned"`
		SenderLiquidityShares Number  `json:"sender_liquidity_shares"`
	}

	EventAddressFeesClaimed struct {
		Event

		Recipient Address `json:"recipient"`
		Amount    Number  `json:"amount"`
	}

	EventReferrerEarnedFees struct {
		Event

		Recipient Address `json:"recipient"`
		Fees      Number  `json:"fees"`
		Volume    Number  `json:"volume"`
	}
)
