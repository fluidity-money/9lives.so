package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"fmt"

	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph/model"
)

// ExplainCampaign is the resolver for the explainCampaign field.
func (r *mutationResolver) ExplainCampaign(ctx context.Context, typeArg model.Modification, name string, outcomes []model.OutcomeInput, ending int, text string, seed int, creator string, sR string, s string, v string) (*bool, error) {
	panic(fmt.Errorf("not implemented: ExplainCampaign - explainCampaign"))
}

// Campaigns is the resolver for the campaigns field.
func (r *queryResolver) Campaigns(ctx context.Context) ([]model.Campaign, error) {
	panic(fmt.Errorf("not implemented: Campaigns - campaigns"))
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
