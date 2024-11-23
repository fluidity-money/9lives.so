// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
)

type Mutation struct {
}

// Outcome associated with a Campaign creation that's notified to the graph.
type OutcomeInput struct {
	// Name of the campaign outcome. Ie, "Donald Trump" for the election.
	Name string `json:"name"`
	// Text description of the outcome.
	Description string `json:"description"`
	// Randomly chosen seed for the creation of the identifier.
	Seed int `json:"seed"`
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
