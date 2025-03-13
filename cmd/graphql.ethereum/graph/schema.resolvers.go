package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/url"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph/model"
	"github.com/fluidity-money/9lives.so/lib/ai"
	"github.com/fluidity-money/9lives.so/lib/crypto"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/types"
	"github.com/fluidity-money/9lives.so/lib/types/banners"
	"github.com/fluidity-money/9lives.so/lib/types/changelog"
	"gorm.io/gorm"
)

// OutcomeName is the resolver for the outcomeName field.
func (r *activityResolver) OutcomeName(ctx context.Context, obj *types.Activity) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("activity is nil")
	}
	outcomes := obj.CampaignContent.Outcomes
	outcomeMap := make(map[string]types.Outcome, len(outcomes))
	for _, _outcome := range outcomes {
		outcomeMap[_outcome.Identifier] = _outcome
	}
	if outcome, found := outcomeMap["0x"+obj.OutcomeID]; found {
		return outcome.Name, nil
	}
	return "", nil
}

// OutcomePic is the resolver for the outcomePic field.
func (r *activityResolver) OutcomePic(ctx context.Context, obj *types.Activity) (*string, error) {
	if obj == nil {
		return nil, fmt.Errorf("activity is nil")
	}
	outcomes := obj.CampaignContent.Outcomes
	outcomeMap := make(map[string]types.Outcome, len(outcomes))
	for _, _outcome := range outcomes {
		outcomeMap[_outcome.Identifier] = _outcome
	}
	if outcome, found := outcomeMap["0x"+obj.OutcomeID]; found {
		return outcome.Picture, nil
	}
	return nil, nil
}

// CampaignName is the resolver for the campaignName field.
func (r *activityResolver) CampaignName(ctx context.Context, obj *types.Activity) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("activity is nil")
	}
	return obj.CampaignContent.Name, nil
}

// CreatedAt is the resolver for the createdAt field.
func (r *activityResolver) CreatedAt(ctx context.Context, obj *types.Activity) (int, error) {
	if obj == nil {
		return 0, fmt.Errorf("activity is nil")
	}
	return int(obj.CreatedAt.Unix()), nil
}

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

// Picture is the resolver for the picture field.
func (r *campaignResolver) Picture(ctx context.Context, obj *types.Campaign) (*string, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Picture, nil
}

// Creator is the resolver for the creator field.
func (r *campaignResolver) Creator(ctx context.Context, obj *types.Campaign) (*types.Wallet, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Creator, nil
}

// CreatedAt is the resolver for the createdAt field.
func (r *campaignResolver) CreatedAt(ctx context.Context, obj *types.Campaign) (int, error) {
	if obj == nil {
		return 0, fmt.Errorf("campaign is nil")
	}
	return int(obj.CreatedAt.Unix()), nil
}

// Settlement is the resolver for the settlement field.
func (r *campaignResolver) Settlement(ctx context.Context, obj *types.Campaign) (model.SettlementType, error) {
	if obj == nil {
		return "", fmt.Errorf("campaign is nil")
	}
	return model.SettlementType(obj.Content.Settlement), nil
}

// OracleDescription is the resolver for the oracleDescription field.
func (r *campaignResolver) OracleDescription(ctx context.Context, obj *types.Campaign) (*string, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.OracleDescription, nil
}

// OracleUrls is the resolver for the oracleUrls field.
func (r *campaignResolver) OracleUrls(ctx context.Context, obj *types.Campaign) ([]*string, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.OracleUrls, nil
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

// Starting is the resolver for the starting field.
func (r *campaignResolver) Starting(ctx context.Context, obj *types.Campaign) (int, error) {
	if obj == nil {
		return 0, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Starting, nil
}

// Ending is the resolver for the ending field.
func (r *campaignResolver) Ending(ctx context.Context, obj *types.Campaign) (int, error) {
	if obj == nil {
		return 0, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Ending, nil
}

// X is the resolver for the x field.
func (r *campaignResolver) X(ctx context.Context, obj *types.Campaign) (*string, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.X, nil
}

// Telegram is the resolver for the telegram field.
func (r *campaignResolver) Telegram(ctx context.Context, obj *types.Campaign) (*string, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Telegram, nil
}

// Web is the resolver for the web field.
func (r *campaignResolver) Web(ctx context.Context, obj *types.Campaign) (*string, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Web, nil
}

// Winner is the resolver for the winner field.
func (r *campaignResolver) Winner(ctx context.Context, obj *types.Campaign) (*string, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.Content.Winner, nil
}

// InvestmentAmounts is the resolver for the investmentAmounts field.
func (r *campaignResolver) InvestmentAmounts(ctx context.Context, obj *types.Campaign) ([]*types.InvestmentAmounts, error) {
	if obj == nil {
		return nil, fmt.Errorf("campaign is nil")
	}
	return obj.InvestmentAmounts, nil
}

// Banners is the resolver for the banners field.
func (r *campaignResolver) Banners(ctx context.Context, obj *types.Campaign) ([]string, error) {
	if obj == nil {
		return nil, fmt.Errorf("empty campaign")
	}
	var b []banners.Banner
	err := r.DB.Table("ninelives_banners_1").
		Where("pool = ?", obj.ID).
		Find(&b).
		Error
	if err != nil {
		slog.Error("Failed to find banners",
			"pool", obj.ID,
			"err", err,
		)
		return nil, fmt.Errorf("find banners: %v", err)
	}
	msgs := make([]string, len(b))
	for i := 0; i < len(b); i++ {
		msgs[i] = b[i].Message
	}
	return msgs, nil
}

// Categories is the resolver for the categories field.
func (r *campaignResolver) Categories(ctx context.Context, obj *types.Campaign) ([]string, error) {
	if obj == nil {
		return nil, fmt.Errorf("empty changelog")
	}
	return obj.Content.Categories, nil
}

// ID is the resolver for the id field.
func (r *changelogResolver) ID(ctx context.Context, obj *changelog.Changelog) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("empty changelog")
	}
	return fmt.Sprintf("%v-%v", obj.Time, obj.Title), nil
}

// AfterTs is the resolver for the afterTs field.
func (r *changelogResolver) AfterTs(ctx context.Context, obj *changelog.Changelog) (int, error) {
	if obj == nil {
		return 0, fmt.Errorf("empty changelog")
	}
	return int(obj.Time.Unix()), nil
}

// HTML is the resolver for the html field.
func (r *changelogResolver) HTML(ctx context.Context, obj *changelog.Changelog) (string, error) {
	if obj == nil {
		return "", fmt.Errorf("empty changelog")
	}
	return obj.HtmlContent, nil
}

// Content is the resolver for the content field.
func (r *claimResolver) Content(ctx context.Context, obj *types.Claim) (*types.Campaign, error) {
	var campaign types.Campaign
	if obj == nil {
		return nil, fmt.Errorf("Claim is nil")
	}
	campaign = types.Campaign{
		ID:        obj.ID,
		Content:   obj.Content,
		CreatedAt: time.Unix(int64(obj.Content.Starting), 0),
		UpdatedAt: time.Unix(int64(obj.Content.Starting), 0),
	}
	return &campaign, nil
}

// CreatedAt is the resolver for the createdAt field.
func (r *claimResolver) CreatedAt(ctx context.Context, obj *types.Claim) (int, error) {
	if obj == nil {
		return 0, fmt.Errorf("claim is nil")
	}
	return int(obj.CreatedAt.Unix()), nil
}

// ExplainCampaign is the resolver for the explainCampaign field.
func (r *mutationResolver) ExplainCampaign(ctx context.Context, typeArg model.Modification, name string, description string, picture *string, seed int, outcomes []model.OutcomeInput, ending int, starting int, creator string, oracleDescription *string, oracleUrls []*string, x *string, telegram *string, web *string, isFake *bool) (*bool, error) {
	isNotPrecommit := isFake == nil || !*isFake
	outcomes_ := make([]crypto.Outcome, len(outcomes))
	if seed < 0 {
		return nil, fmt.Errorf("negative seed")
	}
	curTime := int(time.Now().Unix())
	if curTime >= ending {
		return nil, fmt.Errorf("ending time too early")
	}
	for i, o := range outcomes {
		outcomes_[i] = crypto.Outcome{
			Name: o.Name,
			Seed: uint64(o.Seed),
		}
	}
	marketId := crypto.GetMarketId(outcomes_)
	zeroAddr := ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")
	var (
		tradingAddr *ethCommon.Address = &zeroAddr
		settlement  string             = "ORACLE"
		err         error
	)
	if isNotPrecommit {
		tradingAddr, err = getTradingAddr(r.Geth, r.FactoryAddr, marketId)
		if err != nil {
			slog.Error("Error checking if trading contract is deployed",
				"trading contract", tradingAddr,
				"factory address", r.FactoryAddr,
				"market id", marketId,
				"error", err,
				"is not precommit", isNotPrecommit,
			)
			return nil, fmt.Errorf("error checking if trading contract is deployed")
		}
		settlement, err = getSettlementTypeDesc(
			r.Geth,
			r.InfraMarketAddr,
			r.BeautyContestAddr,
			r.SarpAiAddr,
			*tradingAddr,
		)
		if err != nil {
			slog.Error("Failed to get the settlement type description",
				"trading contract", tradingAddr,
				"factory address", r.FactoryAddr,
				"market id", marketId,
				"error", err,
			)
			return nil, fmt.Errorf("error retrieving oracle type")
		}
	}
	// Create the campaign object
	campaignId, _ := crypto.GetCampaignId(name, description, uint64(seed))
	hexCampaignId := "0x" + hex.EncodeToString(campaignId)
	var tradingAddrStr, contractOwner string
	if isNotPrecommit {
		contractOwner_, err := getOwner(r.Geth, r.FactoryAddr, *tradingAddr)
		if err != nil {
			slog.Error("Error checking if trading contract is deployed",
				"trading contract", tradingAddr,
				"factory address", r.FactoryAddr,
				"market id", marketId,
				"error", err,
				"is not precommit", isNotPrecommit,
			)
			return nil, fmt.Errorf("error checking if trading contract is deployed")
		}
		creator = strings.ToLower(creator)
		tradingAddrStr = strings.ToLower(tradingAddr.Hex())
		contractOwner = strings.ToLower(contractOwner_.Hex())
		if contractOwner != creator {
			slog.Error("Staged creator is not the contract owner",
				"trading contract", tradingAddr,
				"contractOwner", contractOwner,
				"factory address", r.FactoryAddr,
				"market id", marketId,
				"submitted creator", creator,
				"is not precommit", isNotPrecommit,
			)
			return nil, fmt.Errorf(
				"staged creator is not the contract owner for id %x, owner is %v",
				marketId,
				contractOwner,
			)
		}
		var campaignIdCount int64
		err = r.DB.Table("ninelives_campaigns_1").
			Where("id = ?", hexCampaignId).
			Count(&campaignIdCount).
			Error
		if err != nil {
			slog.Error("Error checking the existence of this trading addr",
				"trading contract", tradingAddr,
				"factory address", r.FactoryAddr,
				"market id", marketId,
				"error", err,
				"is not precommit", isNotPrecommit,
			)
			return nil, fmt.Errorf("error finding trading addr existence")
		}
		if campaignIdCount > 0 {
			return nil, fmt.Errorf("trading addr already exists")
		}
	}
	// Create outcomes object
	var campaignOutcomes = make([]types.Outcome, len(outcomes))
	for i, outcome := range outcomes {
		outcomeId, _ := crypto.GetOutcomeId(
			outcome.Name,
			uint64(outcome.Seed),
		)
		hexOutcomeId := "0x" + hex.EncodeToString(outcomeId)
		var shareAddrStr string
		if isNotPrecommit {
			shareAddr, _ := getShareAddr(r.Geth, *tradingAddr, [8]byte(outcomeId))
			shareAddrStr = strings.ToLower(shareAddr.Hex())
		}
		var outcomePicUrl *string
		if pic := outcome.Picture; pic != nil {
			buf, err := decodeAndCheckPictureValidity(*outcome.Picture)
			if err != nil {
				slog.Error("Failed to decode outcome image",
					"err", err,
					"share addr", shareAddrStr,
					"outcome id", outcomeId,
					"trading addr", tradingAddr,
					"is not precommit", isNotPrecommit,
				)
				return nil, fmt.Errorf("bad outcome image")
			}
			picKey := fmt.Sprintf("%v-%v", tradingAddr, shareAddrStr)
			if isNotPrecommit {
				_, err = r.S3UploadManager.Upload(ctx, &s3.PutObjectInput{
					Bucket: aws.String(r.S3UploadBucketName),
					Key:    aws.String(picKey),
					Body:   buf,
				})
				if err != nil {
					slog.Error("Failed to upload a outcome image",
						"trading addr", tradingAddr,
						"outcome key", picKey,
						"creator", creator,
						"err", err,
					)
					return nil, fmt.Errorf("error uploading image")
				}
			}
			// Track the URL that's associated with this share's picture.
			concatUrl, err := url.JoinPath(r.PicturesUriBase, picKey)
			if err != nil {
				slog.Error("Failed to create a URL for a share picture",
					"trading addr", tradingAddr,
					"outcome key", picKey,
					"creator", creator,
					"err", err,
					"is not precommit", isNotPrecommit,
				)
				return nil, fmt.Errorf("error uploading image")
			}
			outcomePicUrl = &concatUrl
		}
		campaignOutcomes[i] = types.Outcome{
			Name:       outcome.Name,
			Picture:    outcomePicUrl,
			Seed:       outcome.Seed,
			Identifier: hexOutcomeId,
			Share: &types.Share{
				Address: shareAddrStr,
			},
		}
	}
	var tradingPicUrl *string
	if picture != nil {
		// Upload the image for the base to S3, so we can serve it later,
		// start by unpacking the base64. This should also blow up if this
		// is bad base64.
		buf, err := decodeAndCheckPictureValidity(*picture)
		if err != nil {
			slog.Error("Failed to decode a image",
				"trading addr", tradingAddr,
				"creator", creator,
				"err", err,
				"is not precommit", isNotPrecommit,
			)
			return nil, fmt.Errorf("error uploading image")
		}
		tradingPicKey := tradingAddrStr + "-base"
		if isNotPrecommit {
			_, err = r.S3UploadManager.Upload(ctx, &s3.PutObjectInput{
				Bucket: aws.String(r.S3UploadBucketName),
				Key:    aws.String(tradingPicKey),
				Body:   buf,
			})
			if err != nil {
				slog.Error("Failed to upload a trading image",
					"trading addr", tradingAddr,
					"trading pic key", tradingPicKey,
					"err", err,
				)
				return nil, fmt.Errorf("error uploading image")
			}
		}
		concatPicUrl, err := url.JoinPath(r.PicturesUriBase, tradingPicKey)
		if err != nil {
			slog.Error("Failed to join a trading image path",
				"trading addr", tradingAddr,
				"trading pic key", tradingPicKey,
				"err", err,
			)
			return nil, fmt.Errorf("error uploading image")
		}
		tradingPicUrl = &concatPicUrl
	}
	var categories []string
	err = r.F.On(features.FeatureUseAIForCategories, func() error {
		categories, err = ai.RequestCategorySuggestions(
			r.LambdaClient,
			ctx,
			r.LambdaMiscAiBackendName,
			name,
		)
		if err != nil {
			slog.Error("Failed to look up a request for categories",
				"name", name,
				"err", err,
			)
			return fmt.Errorf("failed to look up request: %v", err)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	campaign := types.CampaignInsertion{
		ID: hexCampaignId,
		Content: types.CampaignContent{
			Name:        name,
			Description: description,
			Picture:     tradingPicUrl,
			Categories:  categories,
			Seed:        seed,
			Creator: &types.Wallet{
				Address: creator,
			},
			Settlement:        string(settlement),
			OracleDescription: oracleDescription,
			OracleUrls:        oracleUrls,
			PoolAddress:       tradingAddrStr,
			Outcomes:          campaignOutcomes,
			Ending:            ending,
			Starting:          starting,
			X:                 x,
			Telegram:          telegram,
			Web:               web,
		},
	}
	if isNotPrecommit {
		err = r.DB.Table("ninelives_campaigns_1").Create(&campaign).Error
		if err != nil {
			slog.Error("Error inserting campaign into database",
				"error", err,
				"is not precommit", isNotPrecommit,
			)
			return nil, fmt.Errorf("error inserting campaign into database")
		}
	} else {
		stmt := r.DB.Session(&gorm.Session{DryRun: true}).
			Table("ninelives_campaigns_1").
			Create(&campaign).
			Statement
		s := r.DB.Dialector.Explain(stmt.SQL.String(), stmt.Vars...)
		if err := r.DB.Exec("EXPLAIN " + s).Error; err != nil {
			slog.Error("Error explaining a precommit",
				"error", err,
				"is not precommit", isNotPrecommit,
				"stmt", s,
			)
			return nil, fmt.Errorf("error with precommit")
		}
	}
	res := true
	return &res, nil
}

// RevealCommitment is the resolver for the revealCommitment field.
func (r *mutationResolver) RevealCommitment(ctx context.Context, tradingAddr *string, sender *string, seed *string, preferredOutcome *string) (*bool, error) {
	panic(fmt.Errorf("not implemented: RevealCommitment - revealCommitment"))
}

// RevealCommitment2 is the resolver for the revealCommitment2 field.
func (r *mutationResolver) RevealCommitment2(ctx context.Context, tradingAddr *string, sender *string, seed *string, preferredOutcome *string, rr *string, s *string, v *string) (*bool, error) {
	panic(fmt.Errorf("not implemented: RevealCommitment2 - revealCommitment2"))
}

// SynchProfile is the resolver for the synchProfile field.
func (r *mutationResolver) SynchProfile(ctx context.Context, walletAddress string, email string) (*bool, error) {
	var profile = types.Profile{
		WalletAddress: walletAddress,
		Email:         email,
		Settings: types.Settings{
			Notification: true,
		},
	}
	var res bool
	err := r.DB.Table("ninelives_users_1").Create(&profile).Error
	if err != nil {
		res = false
		slog.Error("Error synching profile",
			"wallet address", walletAddress,
			"email", email)
		return &res, fmt.Errorf("error synching profile")
	}
	res = true
	return &res, nil
}

// OutcomeIds is the resolver for the outcomeIds field.
func (r *positionResolver) OutcomeIds(ctx context.Context, obj *types.Position) ([]string, error) {
	if obj == nil {
		return nil, fmt.Errorf("Position is nil")
	}
	return obj.OutcomeIds, nil
}

// Content is the resolver for the content field.
func (r *positionResolver) Content(ctx context.Context, obj *types.Position) (*types.Campaign, error) {
	var campaign types.Campaign
	if obj == nil {
		return nil, fmt.Errorf("Position is nil")
	}
	campaign = types.Campaign{
		ID:        obj.CampaignId,
		Content:   obj.Content,
		CreatedAt: time.Unix(int64(obj.Content.Starting), 0),
		UpdatedAt: time.Unix(int64(obj.Content.Starting), 0),
	}
	return &campaign, nil
}

// Campaigns is the resolver for the campaigns field.
func (r *queryResolver) Campaigns(ctx context.Context, category []string, orderBy *string, searchTerm *string, page *int, pageSize *int, address *string) ([]types.Campaign, error) {
	var campaigns []types.Campaign
	if r.F.Is(features.FeatureGraphqlMockGraph) {
		campaigns = MockGraphCampaigns()
		return campaigns, nil
	}
	query := r.DB.Table("ninelives_campaigns_1").
		Where("shown = TRUE").
		Select("*")
	if address != nil {
		*address = strings.ToLower(*address)
		query = query.Where("content->'creator'->>'address' = ?", *address)
	}
	if len(category) > 0 {
		jsonCategories, err := json.Marshal(category)
		if err != nil {
			return nil, fmt.Errorf("category filter can not be converted to json")
		}
		query = query.Where("content->'categories' @> ?", jsonCategories)
	}
	if searchTerm != nil {
		query = query.Where("name_to_search ILIKE ?", "%"+*searchTerm+"%")
	}
	if orderBy == nil {
		query = query.Order("total_volume DESC").Where("content->>'winner' IS NULL")
	} else if *orderBy == "ended" {
		query = query.Where("content->>'winner' IS NOT NULL").Order("content->>'ending' DESC")
	} else {
		query = query.Where("content->>'winner' IS NULL")
		switch *orderBy {
		case "newest":
			query = query.Order("created_at DESC")
		case "volume":
			query = query.Order("total_volume DESC")
		case "ending":
			query = query.Order("content->>'ending' ASC")
		default:
			return nil, fmt.Errorf("invalid orderBy value")
		}
	}
	pageNum := 0
	if page != nil {
		pageNum = *page
	}
	pageSizeNum := 8
	if pageSize != nil {
		pageSizeNum = *pageSize
	}
	if pageNum != -1 {
		query = query.Offset(pageNum * pageSizeNum).Limit(pageSizeNum)
	}
	err := query.
		Scan(&campaigns).
		Error
	if err != nil {
		slog.Error("Error getting campaigns from database",
			"error", err,
		)
		return nil, fmt.Errorf("error getting campaigns from database: %w", err)
	}
	return campaigns, nil
}

// CampaignByID is the resolver for the campaignById field.
func (r *queryResolver) CampaignByID(ctx context.Context, id string) (*types.Campaign, error) {
	if id == "" || !strings.HasPrefix(id, "0x") {
		return nil, fmt.Errorf("bad id")
	}
	var c types.Campaign
	err := r.DB.Raw(`WITH summed_amounts AS (
    SELECT
        campaign_id,
        outcome_id,
        SUM(from_amount) AS sum_from_amount,
        SUM(to_amount) as sum_to_amount
    FROM
        ninelives_buys_and_sells_1
    WHERE
        "type" = 'buy' AND campaign_id = ?
    GROUP BY
        campaign_id, outcome_id
),
campaign_investments AS (
    SELECT
        campaign_id,
        JSON_AGG(
            JSON_BUILD_OBJECT('id', CONCAT('0x', outcome_id), 'usdc', sum_from_amount, 'share', sum_to_amount)
        ) AS investment_amounts,
        SUM(summed_amounts.sum_from_amount) AS total_volume
    FROM
        summed_amounts
    GROUP BY
        campaign_id
)
SELECT
    	nc.*,
		COALESCE(ci.total_volume, 0) AS total_volume,
		ci.investment_amounts
		FROM
			ninelives_campaigns_1 nc
		LEFT JOIN
        campaign_investments ci ON nc.id = ci.campaign_id
		WHERE
			nc.id = ? AND shown`, id, id).Scan(&c).Error
	if err != nil {
		return nil, fmt.Errorf("campaign find: %v", err)
	}
	return &c, nil
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

// Changelog is the resolver for the changelog field.
func (r *queryResolver) Changelog(ctx context.Context) ([]*changelog.Changelog, error) {
	xs := make([]*changelog.Changelog, len(r.ChangelogItems))
	for i, x := range r.ChangelogItems {
		xs[i] = &x
	}
	return xs, nil
}

// UserActivity is the resolver for the userActivity field.
func (r *queryResolver) UserActivity(ctx context.Context, address string, campaignID *string, page *int, pageSize *int) ([]*types.Activity, error) {
	var activities []*types.Activity
	address = strings.ToLower(address)
	pageNum := 0
	if page != nil {
		pageNum = *page
	}
	pageSizeNum := 8
	if pageSize != nil {
		pageSizeNum = *pageSize
	}
	query := r.DB.Table("ninelives_buys_and_sells_1").Select("*",
		"created_by AS created_at",
		"transaction_hash AS tx_hash",
		"emitter_addr AS pool_address").Where(&types.Activity{Recipient: address})
	if campaignID != nil {
		query = query.Where(&types.Activity{CampaignID: *campaignID})
	}
	err := query.Offset(pageNum * pageSizeNum).Limit(pageSizeNum).Scan(&activities).Error
	if err != nil {
		slog.Error("Error getting activities from database",
			"error", err,
		)
		return nil, fmt.Errorf("error getting activities from database: %w", err)
	}
	return activities, nil
}

// UserParticipatedCampaigns is the resolver for the userParticipatedCampaigns field.
func (r *queryResolver) UserParticipatedCampaigns(ctx context.Context, address string) ([]*types.Position, error) {
	var positions []*types.Position
	address = strings.ToLower(address)
	err := r.DB.Raw(`
	SELECT campaign_id, json_agg(DISTINCT outcome_id) AS outcome_ids, campaign_content AS content
	FROM ninelives_buys_and_sells_1
	WHERE recipient = ? and campaign_id is not null 
	GROUP BY campaign_id, campaign_content;
	`, address).Scan(&positions).Error
	if err != nil {
		slog.Error("Error getting positions from database",
			"error", err,
		)
		return nil, fmt.Errorf("error getting positions from database: %w", err)
	}
	return positions, nil
}

// UserTotalVolume is the resolver for the userTotalVolume field.
func (r *queryResolver) UserTotalVolume(ctx context.Context, address string) (int, error) {
	var totalVolume int
	address = strings.ToLower(address)
	err := r.DB.Raw(`
	select coalesce (SUM(from_amount), 0)
	from ninelives_buys_and_sells_1
	where from_symbol = 'fUSDC' and recipient = ?
	`, address).Scan(&totalVolume).Error
	if err != nil {
		slog.Error("Error getting total volume from database",
			"error", err,
			"address", address,
		)
		return 0, fmt.Errorf("error getting total volume from database: %w", err)
	}
	return totalVolume, nil
}

// PositionsHistory is the resolver for the positionsHistory field.
func (r *queryResolver) PositionsHistory(ctx context.Context, address string, outcomeIds []string) ([]types.Activity, error) {
	var activities []types.Activity
	outcomes := make([]string, len(outcomeIds))
	for i := range outcomeIds {
		// remove hex prefix
		outcomes[i] = outcomeIds[i][2:]
	}
	address = strings.ToLower(address)
	err := r.DB.Table("ninelives_buys_and_sells_1").Select("*",
		"created_by AS created_at",
		"transaction_hash AS tx_hash",
		"emitter_addr AS pool_address").Where("recipient = ?", address).Where("outcome_id IN ?", outcomes).Scan(&activities).Error
	if err != nil {
		slog.Error("Error getting activities from database for the outcome ids",
			"error", err,
			"outcomeIds", outcomeIds,
		)
		return activities, fmt.Errorf("error getting activities from database for the outcome ids: %w", err)
	}
	return activities, nil
}

// UserClaims is the resolver for the userClaims field.
func (r *queryResolver) UserClaims(ctx context.Context, address string, campaignID *string) ([]*types.Claim, error) {
	var claims []*types.Claim
	address = strings.ToLower(address)
	query := r.DB.Raw(`select nc.id, nepa.shares_spent, nepa.fusdc_received, nepa.created_by as created_at, nc.content, concat('0x', nepa.identifier) as winner
	from ninelives_events_payoff_activated nepa
	left join ninelives_campaigns_1 nc 
	on nepa.emitter_addr = nc."content"->>'poolAddress'
	where nepa.recipient = ?`, address)
	if campaignID != nil {
		query = query.Where("nc.id = ?", *campaignID)
	}
	err := query.Scan(&claims).Error
	if err != nil {
		slog.Error("Error getting reward claims from database",
			"error", err,
			"outcomeIds", campaignID,
		)
		return nil, fmt.Errorf("error getting reward claims from database: %w", err)
	}
	return claims, nil
}

// UserProfile is the resolver for the userProfile field.
func (r *queryResolver) UserProfile(ctx context.Context, address string) (*types.Profile, error) {
	var profile types.Profile
	err := r.DB.Table("ninelives_users_1").Where("wallet_address = ?", address).Scan(&profile).Error
	if err != nil {
		slog.Error("Error getting profile from database",
			"error", err,
			"wallet address", address,
		)
		return nil, fmt.Errorf("error getting profile from database: %w", err)
	}
	return &profile, nil
}

// Activity returns ActivityResolver implementation.
func (r *Resolver) Activity() ActivityResolver { return &activityResolver{r} }

// Campaign returns CampaignResolver implementation.
func (r *Resolver) Campaign() CampaignResolver { return &campaignResolver{r} }

// Changelog returns ChangelogResolver implementation.
func (r *Resolver) Changelog() ChangelogResolver { return &changelogResolver{r} }

// Claim returns ClaimResolver implementation.
func (r *Resolver) Claim() ClaimResolver { return &claimResolver{r} }

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Position returns PositionResolver implementation.
func (r *Resolver) Position() PositionResolver { return &positionResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type activityResolver struct{ *Resolver }
type campaignResolver struct{ *Resolver }
type changelogResolver struct{ *Resolver }
type claimResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type positionResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
