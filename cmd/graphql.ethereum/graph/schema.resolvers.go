package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"encoding/hex"
	"fmt"
	"log/slog"
	"strings"

	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph/model"
	"github.com/fluidity-money/9lives.so/lib/crypto"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/types"
)

// Name is the resolver for the name field.
func (r *campaignResolver) Name(ctx context.Context, obj *types.Campaign) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("campaign is nil")
	}
	return obj.Content.Name, nil
}

// Description is the resolver for the description field.
func (r *campaignResolver) Description(ctx context.Context, obj *types.Campaign) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("campaign is nil")
	}
	return obj.Content.Description, nil
}

// Creator is the resolver for the creator field.
func (r *campaignResolver) Creator(ctx context.Context, obj *types.Campaign) (*types.Wallet, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Creator, nil
}

// Oracle is the resolver for the oracle field.
func (r *campaignResolver) Oracle(ctx context.Context, obj *types.Campaign) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("campaign is nil")
	}
	return obj.Content.Oracle, nil
}

// Identifier is the resolver for the identifier field.
func (r *campaignResolver) Identifier(ctx context.Context, obj *types.Campaign) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("campaign is nil")
	}
	return obj.ID, nil
}

// PoolAddress is the resolver for the poolAddress field.
func (r *campaignResolver) PoolAddress(ctx context.Context, obj *types.Campaign) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("campaign is nil")
	}
	return obj.Content.PoolAddress, nil
}

// Outcomes is the resolver for the outcomes field.
func (r *campaignResolver) Outcomes(ctx context.Context, obj *types.Campaign) ([]types.Outcome, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Outcomes, nil
}

// Ending is the resolver for the ending field.
func (r *campaignResolver) Ending(ctx context.Context, obj *types.Campaign) (int, error) {
	if obj == nil {
		return 0, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Ending, nil
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

// Content is the resolver for the content field.
func (r *frontpageResolver) Content(ctx context.Context, obj *types.Frontpage) (*types.Campaign, error) {
	panic(fmt.Errorf("not implemented: Content - content"))
}

// ExplainCampaign is the resolver for the explainCampaign field.
func (r *mutationResolver) ExplainCampaign(ctx context.Context, typeArg model.Modification, name string, description string, seed int, outcomes []model.OutcomeInput, ending int, creator string) (*bool, error) {
	tradingAddr := crypto.GetTradingAddrWithOutcomes(outcomes, r.FactoryAddr, r.TradingHash)
	contractOwner_, err := getOwner(r.Geth, r.FactoryAddr, *tradingAddr)
	if err != nil {
		slog.Error("Error checking if trading contract is deployed",
			"trading contract", tradingAddr,
			"factory address", r.FactoryAddr,
			"error", err,
		)
		return nil, fmt.Errorf("error checking if trading contract is deployed")
	}
	creator = strings.ToLower(creator)
	contractOwner := strings.ToLower(contractOwner_.Hex())
	if contractOwner != creator {
		slog.Error("Staged creator is not the contract owner",
			"trading contract", tradingAddr,
			"contractOwner", contractOwner,
			"factory address", r.FactoryAddr,
		)
		return nil, fmt.Errorf(
			"staged creator is not the contract owner, owner is %v",
			contractOwner,
		)
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
				Address: shareAddress.String(),
			},
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
			PoolAddress: tradingAddr.Hex(),
			Outcomes:    campaignOutcomes,
			Ending:      ending,
		},
	}
	result := r.DB.Table("ninelives_campaigns_1").Create(&campaign)
	if result.Error != nil {
		slog.Error("Error inserting campaign into database",
			"error", result.Error,
		)
		return nil, fmt.Errorf("error inserting campaign into database")
	}
	res := true
	return &res, nil
}

// Campaigns is the resolver for the campaigns field.
func (r *queryResolver) Campaigns(ctx context.Context, category []string) ([]types.Campaign, error) {
	var campaigns []types.Campaign
	if r.F.Is(features.FeatureGraphqlMockGraph) {
		campaigns = MockGraphCampaigns()
		return campaigns, nil
	}
	err := r.DB.Table("ninelives_campaigns_1").Find(&campaigns).Error
	if err != nil {
		slog.Error("Error getting campaigns from database",
			"error", err,
		)
		return nil, fmt.Errorf("error getting campaigns from database")
	}
	return campaigns, nil
}

// Frontpage is the resolver for the frontpage field.
func (r *queryResolver) Frontpage(ctx context.Context, category []string) ([]types.Frontpage, error) {
	panic(fmt.Errorf("not implemented: Frontpage - frontpage"))
}

// SuggestedHeadlines is the resolver for the suggestedHeadlines field.
func (r *queryResolver) SuggestedHeadlines(ctx context.Context) ([]string, error) {
	var headlines []string
	err := r.DB.Table("ninelives_newsfeed_for_today_1").Find(&headlines).Error
	if err != nil {
		return nil, fmt.Errorf("get newsfeed: %v", err)
	}
	return headlines, nil
}

// News is the resolver for the news field.
func (r *queryResolver) News(ctx context.Context) ([]model.News, error) {
	panic(fmt.Errorf("not implemented: News - news"))
}

// Campaign returns CampaignResolver implementation.
func (r *Resolver) Campaign() CampaignResolver { return &campaignResolver{r} }

// Frontpage returns FrontpageResolver implementation.
func (r *Resolver) Frontpage() FrontpageResolver { return &frontpageResolver{r} }

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type campaignResolver struct{ *Resolver }
type frontpageResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
