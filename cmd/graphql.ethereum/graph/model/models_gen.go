// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
)

// Ongoing prediction market competition.
type Campaign struct {
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

type Mutation struct {
}

type Outcome struct {
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

// Outcome associated with a Campaign creation that's notified to the graph.
type OutcomeInput struct {
	// Name of the campaign outcome. Ie, "Donald Trump" for the election.
	Name string `json:"name"`
	// Text description of the outcome.
	Description string `json:"description"`
	// Randomly chosen seed for the creation of the identifier.
	Seed int `json:"seed"`
	// Identifier hex encoded associated with this outcome. Used to derive addresses.
	Identifier string `json:"identifier"`
}

type Query struct {
}

// Share representing the outcome of the current amount.
type Share struct {
	// ERC20 address of this campaign.
	Address string `json:"address"`
}

// Wallet of the creator.
type Wallet struct {
	// Wallet address of this wallet, in hex.
	Address string `json:"address"`
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