package events

import (
	"bytes"
	_ "embed"
	"fmt"
	"math/big"
	"time"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi-events.json
var abiB []byte

var abi, _ = ethAbi.JSON(bytes.NewReader(abiB))

var (
	TopicNewTrading2     = abi.Events["NewTrading2"].ID
	TopicOutcomeCreated  = abi.Events["OutcomeCreated"].ID
	TopicOutcomeDecided  = abi.Events["OutcomeDecided"].ID
	TopicSharesMinted    = abi.Events["SharesMinted"].ID
	TopicPayoffActivated = abi.Events["PayoffActivated"].ID
	TopicDeadlineExtension = abi.Events["DeadlineExtension"].ID
	TopicMarketCreated2 = abi.Events["MarketCreated2"].ID
	TopicCallMade = abi.Events["CallMade"].ID
	TopicInfraMarketClosed = abi.Events["InfraMarketClosed"].ID
	TopicDAOMoneyDistributed = abi.Events["DAOMoneyDistributed"].ID
	TopicCommitted = abi.Events["Committed"].ID
	TopicCommitmentRevealed = abi.Events["CommitmentRevealed"].ID
	TopicCampaignEscaped = abi.Events["CampaignEscaped"].ID
	TopicLockedUp = abi.Events["LockedUp"].ID
	TopicWithdrew = abi.Events["Withdrew"].ID
	TopicSlashed = abi.Events["Slashed"].ID
	TopicFrozen = abi.Events["Frozen"].ID
	TopicRequested = abi.Events["Requested"].ID
	TopicConcluded = abi.Events["Concluded"].ID
)

func UnpackNewTrading2(topic1, topic2, topic3 ethCommon.Hash, b []byte) (*events.EventNewTrading2, string, error) {
	addr := hashToAddr(topic2)
	i, err := abi.Unpack("NewTrading2", b)
	if err != nil {
		return nil, "", err
	}
	backend, ok := i[0].(uint8)
	if !ok {
		return nil, "", fmt.Errorf("bad backend: %T", i[0])
	}
	return &events.EventNewTrading2{
		Identifier: hashToBytes32(topic1),
		Addr:       addr,
		Oracle:     hashToAddr(topic3),
		Backend:    backend,
	}, addr.String(), nil
}

func UnpackOutcomeCreated(topic1, topic2, topic3 ethCommon.Hash) (*events.EventOutcomeCreated, error) {
	return &events.EventOutcomeCreated{
		TradingIdentifier: hashToBytes8(topic1),
		Erc20Identifier:   hashToBytes32(topic2),
		Erc20Addr:         hashToAddr(topic3),
	}, nil
}

func UnpackOutcomeDecided(topic1, topic2 ethCommon.Hash) (*events.EventOutcomeDecided, error) {
	return &events.EventOutcomeDecided{
		Identifier: hashToBytes8(topic1),
		Oracle:     hashToAddr(topic2),
	}, nil
}

func UnpackSharesMinted(topic1, topic2, topic3 ethCommon.Hash, b []byte) (*events.EventSharesMinted, error) {
	i, err := abi.Unpack("SharesMinted", b)
	if err != nil {
		return nil, err
	}
	recipient, ok := i[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("bad recipient: %T", i[0])
	}
	fusdcSpent, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("bad fusdc spent: %T", i[1])
	}
	return &events.EventSharesMinted{
		Identifier:  hashToBytes8(topic1),
		ShareAmount: hashToNumber(topic2),
		Spender:     hashToAddr(topic3),
		Recipient:   events.AddressFromString(recipient.String()),
		FusdcSpent:  events.NumberFromBig(fusdcSpent),
	}, nil
}

func UnpackPayoffActivated(topic1, topic2, topic3 ethCommon.Hash, b []byte) (*events.EventPayoffActivated, error) {
	i, err := abi.Unpack("PayoffActivated", b)
	if err != nil {
		return nil, err
	}
	recipient, ok := i[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("bad recipient: %T", i[0])
	}
	fusdcReceived, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("bad fusdc received: %T", i[1])
	}
	return &events.EventPayoffActivated{
		Identifier:    hashToBytes8(topic1),
		SharesSpent:   hashToNumber(topic2),
		Spender:       hashToAddr(topic3),
		Recipient:     events.AddressFromString(recipient.String()),
		FusdcReceived: events.NumberFromBig(fusdcReceived),
	}, nil
}

func UnpackDeadlineExtension(topic1, topic2 ethCommon.Hash) (*events.EventDeadlineExtension, error) {
	return &events.EventDeadlineExtension{
		TimeBefore: time.Unix(hashToNumber(topic1).Int64(), 0),
		TimeAfter:  time.Unix(hashToNumber(topic2).Int64(), 0),
	}, nil
}

func UnpackMarketCreated2(topic1, topic2, topic3 ethCommon.Hash, d []byte) (*events.EventMarketCreated2, error) {
	a, err := abi.Unpack("MarketCreated2", d)
	if err != nil {
		return nil, err
	}
	launchTs, ok := a[0].(uint64)
	if !ok {
		return nil, fmt.Errorf("bad launch ts: %T", a[0])
	}
	callDeadline, ok := a[1].(uint64)
	if !ok {
		return nil, fmt.Errorf("bad call deadline: %T", a[1])
	}
	return &events.EventMarketCreated2{
		IncentiveSender: hashToAddr(topic1),
		TradingAddr:     hashToAddr(topic2),
		Desc:            hashToBytes32(topic3),
		LaunchTs:        time.Unix(int64(launchTs), 0),
		CallDeadline:    callDeadline,
	}, nil
}

func UnpackCallMade(topic1, topic2, topic3 ethCommon.Hash) (*events.EventCallMade, error) {
	return &events.EventCallMade{
		TradingAddr: hashToAddr(topic1),
		Winner:      hashToBytes8(topic2),
		IncentiveRecipient: hashToAddr(topic3),
	}, nil
}

func UnpackInfraMarketClosed(topic1, topic2, topic3 ethCommon.Hash) (*events.EventInfraMarketClosed, error) {
	return &events.EventInfraMarketClosed{
		IncentiveRecipient: hashToAddr(topic1),
		TradingAddr:        hashToAddr(topic2),
		Winner:             hashToBytes8(topic3),
	}, nil
}

func UnpackDAOMoneyDistributed(topic1, topic2, topic3 ethCommon.Hash) (*events.EventDAOMoneyDistributed, error) {
	return &events.EventDAOMoneyDistributed{
		Amount:    hashToNumber(topic1),
		Recipient: hashToAddr(topic2),
	}, nil
}

func UnpackCommitted(topic1, topic2, topic3 ethCommon.Hash) (*events.EventCommitted, error) {
	return &events.EventCommitted{
		Trading:    hashToAddr(topic1),
		Predictor:  hashToAddr(topic2),
		Commitment: hashToBytes32(topic3),
	}, nil
}

func UnpackCommitmentRevealed(topic1, topic2, topic3 ethCommon.Hash, b []byte) (*events.EventCommitmentRevealed, error) {
	a, err := abi.Unpack("CommitmentRevealed", b)
	if err != nil {
		return nil, err
	}
	caller, ok := a[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("bad caller: %T", a[0])
	}
	bal, ok := a[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("bad bal: %T", a[1])
	}
	return &events.EventCommitmentRevealed{
		Trading:  hashToAddr(topic1),
		Revealer: hashToAddr(topic2),
		Outcome:  hashToBytes32(topic3),
		Caller:   events.AddressFromString(caller.String()),
		Bal:      events.NumberFromBig(bal),
	}, nil
}

func UnpackCampaignEscaped(topic1 ethCommon.Hash) (*events.EventCampaignEscaped, error) {
	return &events.EventCampaignEscaped{
		TradingAddr: hashToAddr(topic1),
	}, nil
}

func UnpackLockedUp(topic1, topic2 ethCommon.Hash) (*events.EventLockedUp, error) {
	return &events.EventLockedUp{
		Amount:    hashToNumber(topic1),
		Recipient: hashToAddr(topic2),
	}, nil
}

func UnpackWithdrew(topic1, topic2 ethCommon.Hash) (*events.EventWithdrew, error) {
	return &events.EventWithdrew{
		Amount:    hashToNumber(topic1),
		Recipient: hashToAddr(topic2),
	}, nil
}

func UnpackSlashed(topic1, topic2, topic3 ethCommon.Hash) (*events.EventSlashed, error) {
	return &events.EventSlashed{
		Victim:        hashToAddr(topic1),
		Recipient:     hashToAddr(topic2),
		SlashedAmount: hashToNumber(topic3),
	}, nil
}

func UnpackFrozen(topic1, topic2 ethCommon.Hash) (*events.EventFrozen, error) {
	return &events.EventFrozen{
		Victim: hashToAddr(topic1),
		Until:  time.Unix(hashToNumber(topic2).Int64(), 0),
	}, nil
}

func UnpackRequested(topic1, topic2 ethCommon.Hash) (*events.EventRequested, error) {
	return &events.EventRequested{
		Trading: hashToAddr(topic1),
		Ticket: hashToNumber(topic2),
	}, nil
}

func UnpackConcluded(topic1 ethCommon.Hash) (*events.EventConcluded, error) {
	return &events.EventConcluded{
		Ticket: hashToNumber(topic1),
	}, nil
}

func hashToBytes32(h ethCommon.Hash) events.Bytes {
	return events.BytesFromSlice(h.Bytes())
}

func hashToBytes8(h ethCommon.Hash) events.Bytes {
	return events.BytesFromSlice(h.Bytes()[:8])
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}

func hashToNumber(h ethCommon.Hash) events.Number {
	return events.NumberFromBig(h.Big())
}
