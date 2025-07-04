// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
)

// Leaderboard position that's sent via the UI.
type LeaderboardPosition struct {
	// Address of the position participant.
	Address string `json:"address"`
	// Accumulated volume that the user has created, rounded down in USDC.
	Volume string `json:"volume"`
}

// Weekly leaderboard display that's sent via the leaderboard endpoint.
type LeaderboardWeekly struct {
	// Top referrers. Only the top 25.
	Referrers []LeaderboardPosition `json:"referrers"`
	// Top volume. Only the top 25.
	Volume []LeaderboardPosition `json:"volume"`
	// Top campaign creators by volume. Only the top 25.
	Creators []LeaderboardPosition `json:"creators"`
}

type Mutation struct {
}

// Outcome associated with a Campaign creation that's notified to the graph.
type OutcomeInput struct {
	// Name of the campaign outcome. Ie, "Donald Trump" for the election.
	Name string `json:"name"`
	// Randomly chosen seed for the creation of the identifier.
	Seed int `json:"seed"`
	// Picture of the outcome.
	Picture *string `json:"picture,omitempty"`
}

type Query struct {
}

// HTTP-like interface for mutation. Either a delete, a logical update, or a put for the
// first time.
type Modification string

const (
	// Delete this modification.
	ModificationDelete Modification = "DELETE"
	// Create this modification.
	ModificationPut Modification = "PUT"
)

var AllModification = []Modification{
	ModificationDelete,
	ModificationPut,
}

func (e Modification) IsValid() bool {
	switch e {
	case ModificationDelete, ModificationPut:
		return true
	}
	return false
}

func (e Modification) String() string {
	return string(e)
}

func (e *Modification) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = Modification(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid Modification", str)
	}
	return nil
}

func (e Modification) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type PaymasterOperation string

const (
	PaymasterOperationMint            PaymasterOperation = "MINT"
	PaymasterOperationSell            PaymasterOperation = "SELL"
	PaymasterOperationAddLiquidity    PaymasterOperation = "ADD_LIQUIDITY"
	PaymasterOperationRemoveLiquidity PaymasterOperation = "REMOVE_LIQUIDITY"
)

var AllPaymasterOperation = []PaymasterOperation{
	PaymasterOperationMint,
	PaymasterOperationSell,
	PaymasterOperationAddLiquidity,
	PaymasterOperationRemoveLiquidity,
}

func (e PaymasterOperation) IsValid() bool {
	switch e {
	case PaymasterOperationMint, PaymasterOperationSell, PaymasterOperationAddLiquidity, PaymasterOperationRemoveLiquidity:
		return true
	}
	return false
}

func (e PaymasterOperation) String() string {
	return string(e)
}

func (e *PaymasterOperation) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = PaymasterOperation(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid PaymasterOperation", str)
	}
	return nil
}

func (e PaymasterOperation) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

// Defines the method used to determine the winner of a campaign.
type SettlementType string

const (
	// Infrastructure market.
	SettlementTypeOracle SettlementType = "ORACLE"
	// Opinion Poll.
	SettlementTypePoll SettlementType = "POLL"
	// A.I Resolver.
	SettlementTypeAi SettlementType = "AI"
	// Contract State.
	SettlementTypeContract SettlementType = "CONTRACT"
)

var AllSettlementType = []SettlementType{
	SettlementTypeOracle,
	SettlementTypePoll,
	SettlementTypeAi,
	SettlementTypeContract,
}

func (e SettlementType) IsValid() bool {
	switch e {
	case SettlementTypeOracle, SettlementTypePoll, SettlementTypeAi, SettlementTypeContract:
		return true
	}
	return false
}

func (e SettlementType) String() string {
	return string(e)
}

func (e *SettlementType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = SettlementType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid SettlementType", str)
	}
	return nil
}

func (e SettlementType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
