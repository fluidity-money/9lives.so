package commitment_reveal

import "github.com/fluidity-money/9lives.so/lib/types/events"

type CommitmentReveal struct {
	TradingAddr, Sender events.Address
	Seed                events.Number
	PreferredOutcome    events.Bytes
}
