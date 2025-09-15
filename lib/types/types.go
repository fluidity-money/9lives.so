package types

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type (
	CampaignInsertion struct {
		ID        string          `gorm:"primaryKey"`
		CreatedAt time.Time       `gorm:"autoCreateTime"`
		UpdatedAt time.Time       `gorm:"autoUpdateTime"`
		Content   CampaignContent `json:"content"`
	}

	Campaign struct {
		ID                string                `gorm:"primaryKey"`
		CreatedAt         time.Time             `gorm:"autoCreateTime"`
		UpdatedAt         time.Time             `gorm:"autoUpdateTime"`
		Content           CampaignContent       `json:"content"`
		TotalVolume       int                   `json:"totalVolume"`
		InvestmentAmounts InvestmentAmountsList `json:"investmentAmounts" gorm:"type:jsonb"`
		LiquidityVested   int                   `json:"liquidityVested"`
		Shares            CampaignShares        `json:"shares"`
	}

	LP struct {
		Liquidity string `json:"liquidity"`
		Campaign
	}

	CampaignProfit struct {
		PoolAddress string `json:"poolAddress"`
		Profit      int    `json:"profit"`
		Winner      string `json:"winner"`
	}

	InvestmentAmounts struct {
		Id    string `json:"id"`
		USDC  int    `json:"usdc"`
		Share int    `json:"share"`
	}

	InvestmentAmountsList []*InvestmentAmounts

	Outcome struct {
		// Name of this campaign.
		Name string `json:"name"`

		// Picture of the outcome as base64 string.
		Picture *string `json:"picture"`

		// Number to salt the identifier of the outcome
		Seed int `json:"seed"`

		// Identifier hex encoded associated with this outcome. Used to derive addresses.
		// Is of the form keccak256(name . description . seed)[:8]
		Identifier string `json:"identifier"`

		// Share address to trade this outcome.
		Share *Share `json:"share"`
	}

	OutcomeList []Outcome

	CampaignShare struct {
		Shares     string `json:"shares"`
		Identifier string `json:"identifier"`
	}

	CampaignShares []*CampaignShare

	CampaignContent struct {
		// Name of the campaign.
		Name string `json:"name"`

		// Description of the campaign in simple text.
		Description string `json:"description"`

		// Picture of the campaign as base64 string.
		Picture *string `json:"picture"`

		// Categories associated with this campaign.
		Categories []string `json:"categories"`

		// Number to salt the identifier (id of the campaigns) of the outcome
		Seed int `json:"seed"`

		// Creator of the campaign.
		Creator *Wallet `json:"creator"`

		// Defines the method used to determine the winner of a campaign.
		Settlement string `json:"settlement"`

		// Oracle description defines under which conditions campaigns conclude if infra market used as settlement source
		OracleDescription *string `json:"oracleDescription"`

		// Oracle URLs are helper sources for documents when the infrastructure market is used as a settlement source.
		OracleUrls []*string `json:"oracleUrls"`

		// Pool address to purchase shares, and to receive the cost function.
		PoolAddress string `json:"poolAddress"`

		// Outcomes associated with this campaign.
		Outcomes OutcomeList `json:"outcomes"`

		// Ending date of the campaign. Unix timestamp in miliseconds.
		Ending int `json:"ending"`

		// Starting date of the campaign. Unix timestamp in miliseconds.
		Starting int `json:"starting"`

		// X/Twitter username.
		X *string `json:"x"`

		// Telegram username.
		Telegram *string `json:"telegram"`

		// Web url
		Web *string `json:"web"`

		// If any outcome declared as winner, it returns bytes8 id
		Winner *string `json:"winner"`

		// for dpm markets it is true, for amms false
		IsDpm *bool `json:"isDpm"`
	}

	// Wallet of the creator of a campaign.
	Wallet struct {
		// Wallet address of this wallet, in hex.
		Address string `json:"address"`
	}

	// Share representing the outcome of the current amount.
	Share struct {
		// ERC20 address of this campaign.
		Address string `json:"address"`
	}

	// TrackedTradingContract that was created by the NewTrading event.
	TrackedTradingContract struct {
		BlockHash       string `json:"block_hash"`
		TransactionHash string `json:"transaction_hash"`
		TradingAddr     string `json:"trading_addr"`
	}

	Activity struct {
		// Transaction hash of the activity.
		TxHash string `json:"txHash"`
		// Address of the recipient involved in the activity.
		Recipient string `json:"recipient"`
		// Pool address associated with the activity.
		PoolAddress string `json:"poolAddress"`
		// Amount of the asset being transferred from.
		FromAmount int `json:"fromAmount"`
		// Symbol of the asset being transferred from.
		FromSymbol string `json:"fromSymbol"`
		// Amount of the asset being transferred to.
		ToAmount int `json:"toAmount"`
		// Symbol of the asset being transferred to.
		ToSymbol string `json:"toSymbol"`
		// Type of the activity (buy, sell).
		Type ActivityType `json:"type"`
		// ID of the outcome associated with the activity.
		OutcomeID string `json:"outcomeId"`
		// ID of the campaign associated with the activity.
		CampaignID string `json:"campaignId"`
		// Total volume of the activity.
		TotalVolume int `json:"totalVolume"`
		// Timestamp of when the activity was created.
		CreatedAt time.Time `json:"createdAt"`
		// Content of the campaign associated with the activity.
		CampaignContent CampaignContent `json:"campaignContent"`
	}

	ActivityType string

	OutcomeIds []string

	Position struct {
		CampaignId string `json:"campaignId"`

		OutcomeIds OutcomeIds `json:"outcomeIds" gorm:"type:jsonb"`

		Content CampaignContent `json:"content"`
	}

	Settings struct {
		Notification bool `json:"notification"`

		// Referrer is sent to the user with the address of the referrer.
		Referrer string `json:"referrer"`
	}

	Profile struct {
		WalletAddress string `json:"walletAddress"`

		Email string `json:"email"`

		Settings Settings `json:"settings" gorm:"serializer:json"`
	}

	Claim struct {
		ID string `json:"id"`

		SharesSpent string `json:"sharesSpent"`

		FusdcReceived string `json:"fusdcReceived"`

		Content CampaignContent `json:"content"`

		Winner string `json:"winner"`

		CreatedAt time.Time `json:"createdAt"`
	}
)

const (
	ActivityTypeBuy  ActivityType = "buy"
	ActivityTypeSell ActivityType = "sell"
)

func JSONMarshal(v interface{}) (driver.Value, error) {
	return json.Marshal(v)
}

func JSONUnmarshal(value interface{}, v interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal %T, expected []byte", v)
	}
	return json.Unmarshal(bytes, v)
}

func (w Wallet) Value() (driver.Value, error) {
	return JSONMarshal(w)
}

func (w *Wallet) Scan(value interface{}) error {
	return JSONUnmarshal(value, w)
}

func (w Share) Value() (driver.Value, error) {
	return JSONMarshal(w)
}

func (w *Share) Scan(value interface{}) error {
	return JSONUnmarshal(value, w)
}

func (o Outcome) Value() (driver.Value, error) {
	return JSONMarshal(o)
}

func (o *Outcome) Scan(value interface{}) error {
	return JSONUnmarshal(value, o)
}

func (ol OutcomeList) Value() (driver.Value, error) {
	return JSONMarshal(ol)
}

func (ol *OutcomeList) Scan(value interface{}) error {
	return JSONUnmarshal(value, ol)
}

func (content CampaignContent) Value() (driver.Value, error) {
	return JSONMarshal(content)
}

func (content *CampaignContent) Scan(value interface{}) error {
	return JSONUnmarshal(value, content)
}

func (ai InvestmentAmounts) Value() (driver.Value, error) {
	return JSONMarshal(ai)
}

func (ai InvestmentAmounts) Scan(value interface{}) error {
	return JSONUnmarshal(value, ai)
}

func (ai InvestmentAmountsList) Value() (driver.Value, error) {
	return JSONMarshal(ai)
}

func (ai *InvestmentAmountsList) Scan(value interface{}) error {
	return JSONUnmarshal(value, ai)
}

func (ois OutcomeIds) Value() (driver.Value, error) {
	return JSONMarshal(ois)
}

func (ois *OutcomeIds) Scan(value interface{}) error {
	return JSONUnmarshal(value, ois)
}

func (cs CampaignShare) Value() (driver.Value, error) {
	return JSONMarshal(cs)
}

func (cs CampaignShare) Scan(value interface{}) error {
	return JSONUnmarshal(value, cs)
}

func (css CampaignShares) Value() (driver.Value, error) {
	return JSONMarshal(css)
}

func (css *CampaignShares) Scan(value interface{}) error {
	return JSONUnmarshal(value, css)
}

type Frontpage struct {
	Campaigns []Campaign `json:"campaigns"`
}
