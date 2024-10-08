package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"encoding/hex"
	"fmt"
	"log/slog"

	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph/model"
	"github.com/fluidity-money/9lives.so/lib/crypto"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/types"
)

// Name is the resolver for the name field.
func (r *campaignResolver) Name(ctx context.Context, obj *types.Campaign) (string, error) {
	panic(fmt.Errorf("not implemented: Name - name"))
}

// Description is the resolver for the description field.
func (r *campaignResolver) Description(ctx context.Context, obj *types.Campaign) (string, error) {
	panic(fmt.Errorf("not implemented: Description - description"))
}

// Creator is the resolver for the creator field.
func (r *campaignResolver) Creator(ctx context.Context, obj *types.Campaign) (*types.Wallet, error) {
	panic(fmt.Errorf("not implemented: Creator - creator"))
}

// Oracle is the resolver for the oracle field.
func (r *campaignResolver) Oracle(ctx context.Context, obj *types.Campaign) (string, error) {
	panic(fmt.Errorf("not implemented: Oracle - oracle"))
}

// Identifier is the resolver for the identifier field.
func (r *campaignResolver) Identifier(ctx context.Context, obj *types.Campaign) (string, error) {
	panic(fmt.Errorf("not implemented: Identifier - identifier"))
}

// PoolAddress is the resolver for the poolAddress field.
func (r *campaignResolver) PoolAddress(ctx context.Context, obj *types.Campaign) (string, error) {
	panic(fmt.Errorf("not implemented: PoolAddress - poolAddress"))
}

// Outcomes is the resolver for the outcomes field.
func (r *campaignResolver) Outcomes(ctx context.Context, obj *types.Campaign) ([]types.Outcome, error) {
	panic(fmt.Errorf("not implemented: Outcomes - outcomes"))
}

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
func (r *mutationResolver) ExplainCampaign(ctx context.Context, typeArg model.Modification, name string, description string, seed int, outcomes []model.OutcomeInput, ending int, creator string) (*bool, error) {
	// Check the user's signature
	// authHeader, ok := ctx.Value("authHeader").(string)
	// if !ok || authHeader == "" {
	// 	return nil, fmt.Errorf("authorization token is missing")
	// }
	// signerWallet, err := verifyAuthTokenAddress(authHeader)
	// if err != nil {
	// 	return nil, err
	// }
	// if creator != signerWallet {
	// 	slog.Error("Creator address does not match the signer wallet",
	// 		"creator address", creator,
	// 		"signer wallet", signerWallet,
	// 	)
	// 	return nil, fmt.Errorf("creator address does not match the signer wallet")
	// }
	// slog.Debug("Check authentication",
	// 	"validated wallet", signerWallet,
	// )
	tradingAddr := getTradingAddrWithOutcomes(outcomes, r.FactoryAddr, r.TradingBytecode)
	isTradingContracCreated, err := isContractCreated(r.Geth, r.FactoryAddr, *tradingAddr)
	if err != nil {
		slog.Error("Error checking if trading contract is deployed",
			"trading contract", tradingAddr,
			"factory address", r.FactoryAddr,
			"error", err,
		)
		return nil, fmt.Errorf("error checking if trading contract is deployed")
	}
	if !*isTradingContracCreated {
		slog.Error("trading contract is not created",
			"trading contract", tradingAddr,
			"factory address", r.FactoryAddr,
		)
		return nil, fmt.Errorf("trading contract is not created")
	}
	// Create outcomes object
	var campaignOutcomes = make([]types.Outcome, len(outcomes))
	for i, outcome := range outcomes {
		outcomeId, _ := crypto.GetOutcomeId(outcome.Name, outcome.Description, outcome.Seed)
		hexOutcomeId := "0x" + hex.EncodeToString(outcomeId)
		shareAddress, _ := getShareAddr(r.Geth, *tradingAddr, [8]byte(outcomeId))
		campaignOutcomes[i] = types.Outcome{
			Name:        outcome.Name,
			Description: outcome.Description,
			Seed:        outcome.Seed,
			Identifier:  hexOutcomeId,
			Share: &types.Share{
				Address: shareAddress.String()},
		}
	}
	// Create the campaign object
	campaignId, _ := crypto.GetOutcomeId(name, description, seed)
	hexCampaignId := "0x" + hex.EncodeToString(campaignId)
	campaign := types.Campaign{
		ID: hexCampaignId,
		Content: types.CampaignContent{
			Name:        name,
			Description: description,
			Seed:        seed,
			Creator: &types.Wallet{
				Address: creator,
			},
			Oracle:      "n/a",
			PoolAddress: "n/a",
			Outcomes:    campaignOutcomes,
		}}
	result := r.DB.Table("campaigns_1").Create(&campaign)
	if result.Error != nil {
		slog.Error("Error inserting campaign into database",
			"error", result.Error,
		)
		return nil, fmt.Errorf("error inserting campaign into database")
	}
	res := true
	return &res, nil
}

// Campaign is the resolver for the campaign field.
func (r *outcomeResolver) Campaign(ctx context.Context, obj *types.Outcome) (*types.Campaign, error) {
	panic(fmt.Errorf("not implemented: Campaign - campaign"))
}

// Creator is the resolver for the creator field.
func (r *outcomeResolver) Creator(ctx context.Context, obj *types.Outcome) (*types.Wallet, error) {
	panic(fmt.Errorf("not implemented: Creator - creator"))
}

// Contracts is the resolver for the contracts field.
func (r *queryResolver) Contracts(ctx context.Context) (*model.Contracts, error) {
	panic(fmt.Errorf("not implemented: Contracts - contracts"))
}

// Frontpage is the resolver for the frontpage field.
func (r *queryResolver) Frontpage(ctx context.Context) ([]types.Frontpage, error) {
	panic(fmt.Errorf("not implemented: Frontpage - frontpage"))
}

// Campaign returns CampaignResolver implementation.
func (r *Resolver) Campaign() CampaignResolver { return &campaignResolver{r} }

// Frontpage returns FrontpageResolver implementation.
func (r *Resolver) Frontpage() FrontpageResolver { return &frontpageResolver{r} }

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Outcome returns OutcomeResolver implementation.
func (r *Resolver) Outcome() OutcomeResolver { return &outcomeResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type campaignResolver struct{ *Resolver }
type frontpageResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type outcomeResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//   - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//     it when you're done.
//   - You have helper methods in this file. Move them out to keep these resolver files clean.
func (r *queryResolver) Campaigns(ctx context.Context) ([]types.CampaignContent, error) {
	if r.F.Is(features.FeatureGraphqlMockGraph) {
		return MockGraphCampaigns()
	}
	return nil, nil
}
