package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph/model"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/types"
)

// ID is the resolver for the id field.
func (r *frontpageResolver) ID(ctx context.Context, obj *types.Frontpage) (string, error) {
	panic(fmt.Errorf("not implemented: ID - id"))
}

// From is the resolver for the from field.
func (r *frontpageResolver) From(ctx context.Context, obj *types.Frontpage) (int, error) {
	panic(fmt.Errorf("not implemented: From - from"))
}

// Until is the resolver for the until field.
func (r *frontpageResolver) Until(ctx context.Context, obj *types.Frontpage) (int, error) {
	panic(fmt.Errorf("not implemented: Until - until"))
}

// Categories is the resolver for the categories field.
func (r *frontpageResolver) Categories(ctx context.Context, obj *types.Frontpage) ([]string, error) {
	panic(fmt.Errorf("not implemented: Categories - categories"))
}

// ExplainCampaign is the resolver for the explainCampaign field.
func (r *mutationResolver) ExplainCampaign(ctx context.Context, typeArg model.Modification, name string, description string, outcomes []model.OutcomeInput, ending int, creator string) (*bool, error) {
	// Check the user's signature
	authHeader, ok := ctx.Value("authHeader").(string)
	if !ok || authHeader == "" {
		return nil, fmt.Errorf("authorization token is missing")
	}
	signerWallet, err := verifyAuthTokenAddress(authHeader)
	if err != nil {
		return nil, err
	}
	if creator != signerWallet {
		slog.Error("Creator address does not match the signer wallet",
			"creator address", creator,
			"signer wallet", signerWallet,
		)
		return nil, fmt.Errorf("creator address does not match the signer wallet")
	}
	slog.Debug("Check authentication",
		"validated wallet", signerWallet,
	)
	tradingAddr := getTradingAddrWithOutcomes(outcomes, r.FactoryAddr, r.TradingBytecode)
	// Check that the trading and share contracts created on-chain
	isTradingContracCreated, err := isContractCreated(r.Geth, r.FactoryAddr, *tradingAddr)
	if err != nil {
		slog.Error("Error checking if trading contract is deployed",
			"trading contract", tradingAddr,
			"factory address", r.FactoryAddr,
			"error", err,
		)
		return nil, fmt.Errorf("missing contract code")
	}
	return isTradingContracCreated, nil
}

// Contracts is the resolver for the contracts field.
func (r *queryResolver) Contracts(ctx context.Context) (*model.Contracts, error) {
	panic(fmt.Errorf("not implemented: Contracts - contracts"))
}

// Frontpage is the resolver for the frontpage field.
func (r *queryResolver) Frontpage(ctx context.Context) ([]types.Frontpage, error) {
	panic(fmt.Errorf("not implemented: Frontpage - frontpage"))
}

// Frontpage returns FrontpageResolver implementation.
func (r *Resolver) Frontpage() FrontpageResolver { return &frontpageResolver{r} }

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type frontpageResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//   - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//     it when you're done.
//   - You have helper methods in this file. Move them out to keep these resolver files clean.
func (r *queryResolver) Campaigns(ctx context.Context) ([]types.Campaign, error) {
	if r.F.Is(features.FeatureGraphqlMockGraph) {
		return MockGraphCampaigns()
	}
	return nil, nil
}
