package referrer

import "github.com/fluidity-money/9lives.so/lib/types"

type Referrer struct {
	CreatedAt time.Time     `json:"created_at"`
	Owner     types.Address `json:"owner"`
	Code      string        `json:"code"`
}
