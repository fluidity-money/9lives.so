package paymaster

import "github.com/fluidity-money/9lives.so/lib/types/events"

const (
	PaymasterTypeMint = uint8(iota)
	PaymasterTypeBurn
	PaymasterTypeAddLiquidity
	PaymasterTypeRemoveLiquidity
)

type Poll struct {
	ID       int            `gorm:"primaryKey"`
	Owner    events.Address `json:"owner"`
	Deadline int            `json:"deadline"`
	Typ      uint8          `json:"typ"`
	PermitR  *events.Bytes  `json:"permitR"`
	PermitS  *events.Bytes  `json:"permitS"`
	PermitV  uint8          `json:"permitV"`
	// Market address use here needs to be tested by the graphql to be careful.
	Market             events.Address  `json:"market"`
	MaximumFee         events.Number   `json:"maximumFee"`
	AmountToSpend      events.Number   `json:"amountToSepnd"`
	MinimumBack        events.Number   `json:"minimumBack"`
	Referrer           *events.Address `json:"referrer"`
	Outcome            *events.Bytes   `json:"outcome"`
	V                  uint8           `json:"v"`
	R                  events.Bytes    `json:"r"`
	S                  events.Bytes    `json:"s"`
	OriginatingChainId events.Number   `json:"originatingChainId"`
	Nonce              events.Number   `json:"nonce"`
}
