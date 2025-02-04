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
		Picture string `json:"picture"`

		// Number to salt the identifier of the outcome
		Seed int `json:"seed"`

		// Identifier hex encoded associated with this outcome. Used to derive addresses.
		// Is of the form keccak256(name . description . seed)[:8]
		Identifier string `json:"identifier"`

		// Share address to trade this outcome.
		Share *Share `json:"share"`
	}

	OutcomeList []Outcome

	CampaignContent struct {
		// Name of the campaign.
		Name string `json:"name"`

		// Description of the campaign in simple text.
		Description string `json:"description"`

		// Picture of the campaign as base64 string.
		Picture string `json:"picture"`

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

type Frontpage struct {
	Campaigns []Campaign `json:"campaigns"`
}
