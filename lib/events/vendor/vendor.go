package vendor

import (
	"bytes"
	_ "embed"
	"fmt"
	"math/big"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi.json
var abiB []byte

var abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

var (
	TopicBorrow   = abi.Events["Borrow"].ID
	TopicDeposit  = abi.Events["Deposit"].ID
	TopicRepay    = abi.Events["Repay"].ID
	TopicRollIn   = abi.Events["RollIn"].ID
	TopicWithdraw = abi.Events["Withdraw"].ID
)

type (
	EventBorrow struct {
		events.Event

		Borrower            events.Address `json:"borrower"`
		VendorFees          events.Number  `json:"vendor_fees"`
		LenderFees          events.Number  `json:"lender_fees"`
		BorrowRate          events.Number            `json:"borrow_rate"`
		AdditionalColAmount events.Number  `json:"additional_col_amount"`
		AdditionalDebt      events.Number  `json:"additional_debt"`
	}

	EventDeposit struct {
		events.Event

		Lender events.Address `json:"lender"`
		Amount events.Number  `json:"amount"`
	}

	EventRepay struct {
		events.Event

		Borrower    events.Address `json:"borrower"`
		DebtRepaid  events.Number  `json:"debt_repaid"`
		ColReturned events.Number  `json:"col_returned"`
	}

	EventRollIn struct {
		events.Event

		Borrower       events.Address `json:"borrower"`
		OriginPool     events.Address `json:"origin_pool"`
		OriginDebt     events.Number  `json:"origin_debt"`
		LendToRepay    events.Number  `json:"lend_to_repay"`
		LenderFeeAmt   events.Number  `json:"lender_fee_amt"`
		ProtocolFeeAmt events.Number  `json:"protocol_fee_amt"`
		ColRolled      events.Number  `json:"col_rolled"`
		ColToReimburse events.Number  `json:"col_to_reimburse"`
	}

	EventRolloverPoolSet struct {
		events.Event

		Pool   events.Address `json:"pool"`
		Amount events.Number  `json:"amount"`
	}

	EventWithdraw struct {
		events.Event

		Lender events.Address `json:"lender"`
		Amount events.Number  `json:"amount"`
	}
)

func UnpackBorrow(topic1 ethCommon.Hash, d []byte) (*EventBorrow, error) {
	i, err := abi.Unpack("Borrow", d)
	if err != nil {
		return nil, fmt.Errorf("borrow: %v", err)
	}
	vendorFees, ok := i[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("vendorFees: %T", i[0])
	}
	lenderFees, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("lenderFees: %T", i[1])
	}
	borrowRate, ok := i[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("borrowRate: %T", i[2])
	}
	additionalColAmount, ok := i[3].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("additionalColAmount: %T", i[3])
	}
	additionalDebt, ok := i[4].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("additionalDebt: %T", i[4])
	}
	return &EventBorrow{
		Borrower:            hashToAddr(topic1),
		VendorFees:          events.NumberFromBig(vendorFees),
		LenderFees:          events.NumberFromBig(lenderFees),
		BorrowRate:          events.NumberFromBig(borrowRate),
		AdditionalColAmount: events.NumberFromBig(additionalColAmount),
		AdditionalDebt:      events.NumberFromBig(additionalDebt),
	}, nil
}

func UnpackDeposit(topic1 ethCommon.Hash, d []byte) (*EventDeposit, error) {
	i, err := abi.Unpack("Deposit", d)
	if err != nil {
		return nil, fmt.Errorf("deposit: %v", err)
	}
	amount, ok := i[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amount: %T", i[0])
	}
	return &EventDeposit{
		Lender: hashToAddr(topic1),
		Amount: events.NumberFromBig(amount),
	}, nil
}

func UnpackRepay(topic1 ethCommon.Hash, d []byte) (*EventRepay, error) {
	i, err := abi.Unpack("Repay", d)
	if err != nil {
		return nil, fmt.Errorf("repay: %v", err)
	}
	debtRepaid, ok := i[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("debtRepaid: %T", i[0])
	}
	colReturned, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("colReturned: %T", i[1])
	}
	return &EventRepay{
		Borrower:    hashToAddr(topic1),
		DebtRepaid:  events.NumberFromBig(debtRepaid),
		ColReturned: events.NumberFromBig(colReturned),
	}, nil
}

func UnpackRollIn(topic1 ethCommon.Hash, d []byte) (*EventRollIn, error) {
	i, err := abi.Unpack("RollIn", d)
	if err != nil {
		return nil, fmt.Errorf("rollIn: %v", err)
	}

	originPool, ok := i[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("originPool: %T", i[0])
	}
	originDebt, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("originDebt: %T", i[1])
	}
	lendToRepay, ok := i[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("lendToRepay: %T", i[2])
	}
	lenderFeeAmt, ok := i[3].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("lenderFeeAmt: %T", i[3])
	}
	protocolFeeAmt, ok := i[4].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("protocolFeeAmt: %T", i[4])
	}
	colRolled, ok := i[5].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("colRolled: %T", i[5])
	}
	colToReimburse, ok := i[6].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("colToReimburse: %T", i[6])
	}

	return &EventRollIn{
		Borrower:       hashToAddr(topic1),
		OriginPool:     events.AddressFromString(originPool.String()),
		OriginDebt:     events.NumberFromBig(originDebt),
		LendToRepay:    events.NumberFromBig(lendToRepay),
		LenderFeeAmt:   events.NumberFromBig(lenderFeeAmt),
		ProtocolFeeAmt: events.NumberFromBig(protocolFeeAmt),
		ColRolled:      events.NumberFromBig(colRolled),
		ColToReimburse: events.NumberFromBig(colToReimburse),
	}, nil
}

func UnpackWithdraw(topic1 ethCommon.Hash, d []byte) (*EventWithdraw, error) {
	i, err := abi.Unpack("Withdraw", d)
	if err != nil {
		return nil, fmt.Errorf("withdraw: %v", err)
	}
	amount, ok := i[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amount: %T", i[0])
	}
	return &EventWithdraw{
		Lender: hashToAddr(topic1),
		Amount: events.NumberFromBig(amount),
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}
