package crypto

import (
	"bytes"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"math/big"
	"sort"

	"github.com/fluidity-money/9lives.so/lib/types/events"
	"github.com/fluidity-money/9lives.so/lib/types/paymaster"

	ethCommon "github.com/ethereum/go-ethereum/common"
	ethMath "github.com/ethereum/go-ethereum/common/math"
	ethCrypto "github.com/ethereum/go-ethereum/crypto"
	ethApiTypes "github.com/ethereum/go-ethereum/signer/core/apitypes"
)

type Outcome struct {
	Name string
	Seed uint64
}

func GetCampaignId(name, desc string, seed uint64) ([]byte, error) {
	var buf bytes.Buffer
	if _, err := buf.WriteString(name); err != nil {
		return nil, err
	}
	if _, err := buf.WriteString(desc); err != nil {
		return nil, err
	}
	err := binary.Write(&buf, binary.BigEndian, uint64(seed))
	if err != nil {
		return nil, err
	}
	x := ethCrypto.Keccak256(buf.Bytes())[:8]
	return x, nil
}

func GetOutcomeId(name string, seed uint64) ([]byte, error) {
	var buf bytes.Buffer
	if _, err := buf.WriteString(name); err != nil {
		return nil, err
	}
	err := binary.Write(&buf, binary.BigEndian, uint64(seed))
	if err != nil {
		return nil, err
	}
	x := ethCrypto.Keccak256(buf.Bytes())[:8]
	return x, nil
}

func GetOutcomeIds(outcomes []Outcome) (ids [][]byte, err error) {
	ids = make([][]byte, len(outcomes))
	for i, o := range outcomes {
		ids[i], err = GetOutcomeId(o.Name, o.Seed)
		if err != nil {
			return nil, fmt.Errorf("get outcome id: %v", err)
		}
	}
	// Sort the ids given by first the length, then by a ascending sort.
	sort.Slice(ids, func(i, j int) bool {
		if len(ids[i]) != len(ids[j]) {
			return len(ids[i]) < len(ids[j])
		}
		return bytes.Compare(ids[i], ids[j]) <= 0
	})
	return
}

func GetMarketId(outcomes []Outcome) []byte {
	ids, err := GetOutcomeIds(outcomes)
	if err != nil {
		return nil
	}
	return ethCrypto.Keccak256(ids...)
}

type PaymasterOperation struct {
	Owner                                  ethCommon.Address
	OriginatingChainId, Nonce, Deadline    *big.Int
	PaymasterType                          uint8
	PermitR, PermitS                       [32]byte
	PermitV                                uint8
	Market                                 ethCommon.Address
	MaximumFee, AmountToSpend, MinimumBack *big.Int
	Referrer                               ethCommon.Address
	Outcome                                [8]byte
	V                                      uint8
	R, S                                   [32]byte
}

func PollToPaymasterOperation(x paymaster.Poll) PaymasterOperation {
	return PaymasterOperation{
		Owner:              addrToEthAddr(x.Owner),
		OriginatingChainId: x.OriginatingChainId.Big(),
		Nonce:              x.Nonce.Big(),
		Deadline:           new(big.Int).SetInt64(int64(x.Deadline)),
		PaymasterType:      x.Typ,
		PermitR:            maybeBytesToBytes32(x.PermitR),
		PermitS:            maybeBytesToBytes32(x.PermitS),
		PermitV:            x.PermitV,
		Market:             addrToEthAddr(x.Market),
		MaximumFee:         x.MaximumFee.Big(),
		AmountToSpend:      x.AmountToSpend.Big(),
		MinimumBack:        x.MinimumBack.Big(),
		Referrer:           maybeAddrToEthAddr(x.Referrer),
		Outcome:            maybeBytesToBytes8(x.Outcome),
		V:                  x.V,
		R:                  bytesToBytes32(x.R),
		S:                  bytesToBytes32(x.S),
	}
}

func hashChainId(x *big.Int) string {
	b := make([]byte, 32)
	x.FillBytes(b)
	return "0x" + hex.EncodeToString(ethCrypto.Keccak256(b))
}

func EcrecoverPaymasterOperation(spnChainId, originatingChainId *big.Int, verifyingContract ethCommon.Address, op PaymasterOperation) (*ethCommon.Address, error) {
	sig := make([]byte, 65)
	copy(sig[:32], op.R[:])
	copy(sig[32:64], op.S[:])
	sig[64] = op.V - 27
	// We set the chain id to be the originating chain so there are
	// no issues involving warnings on the client side for the users.
	chainId := ethMath.HexOrDecimal256(*originatingChainId)
	salt := hashChainId(spnChainId)
	typedData := ethApiTypes.TypedData{
		Types: ethApiTypes.Types{
			"EIP712Domain": {
				{Name: "name", Type: "string"},
				{Name: "version", Type: "string"},
				{Name: "chainId", Type: "uint256"},
				{Name: "verifyingContract", Type: "address"},
				{Name: "salt", Type: "bytes32"},
			},
			"NineLivesPaymaster": {
				{Name: "owner", Type: "address"},
				{Name: "nonce", Type: "uint256"},
				{Name: "deadline", Type: "uint256"},
				{Name: "typ", Type: "uint8"},
				{Name: "market", Type: "address"},
				{Name: "maximumFee", Type: "uint256"},
				{Name: "amountToSpend", Type: "uint256"},
				{Name: "minimumBack", Type: "uint256"},
				{Name: "referrer", Type: "address"},
				{Name: "outcome", Type: "bytes8"},
			},
		},
		PrimaryType: "NineLivesPaymaster",
		Domain: ethApiTypes.TypedDataDomain{
			Name:              "NineLivesPaymaster",
			Version:           "1",
			ChainId:           &chainId,
			VerifyingContract: verifyingContract.String(),
			Salt:              salt,
		},
		Message: ethApiTypes.TypedDataMessage{
			"owner":         op.Owner.String(),
			"nonce":         op.Nonce,
			"deadline":      op.Deadline,
			"typ":           new(big.Int).SetInt64(int64(op.PaymasterType)),
			"market":        op.Market.String(),
			"maximumFee":    op.MaximumFee,
			"amountToSpend": op.AmountToSpend,
			"minimumBack":   op.MinimumBack,
			"referrer":      op.Referrer.String(),
			"outcome":       fmt.Sprintf("0x%x", op.Outcome),
		},
	}
	domainSeparator, err := typedData.HashStruct(
		"EIP712Domain",
		typedData.Domain.Map(),
	)
	if err != nil {
		return nil, fmt.Errorf("domain separator: %v", err)
	}
	typedDataHash, err := typedData.HashStruct(
		typedData.PrimaryType,
		typedData.Message,
	)
	if err != nil {
		return nil, fmt.Errorf("hash typed data: %v", err)
	}
	hash := ethCrypto.Keccak256Hash([]byte(fmt.Sprintf(
		"\x19\x01%s%s",
		string(domainSeparator),
		string(typedDataHash),
	)))
	publicKey, err := ethCrypto.SigToPub(hash.Bytes(), sig)
	if err != nil {
		return nil, fmt.Errorf("public key: %v", err)
	}
	addr := ethCrypto.PubkeyToAddress(*publicKey)
	return &addr, nil
}

func maybeAddrToEthAddr(x *events.Address) ethCommon.Address {
	if x == nil {
		return ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")
	}
	return addrToEthAddr(*x)
}

func addrToEthAddr(x events.Address) ethCommon.Address {
	return ethCommon.HexToAddress(x.String())
}

func bytesToBytes32(x events.Bytes) (b [32]byte) {
	copy(b[:], x.Bytes())
	return
}

func maybeBytesToBytes32(x *events.Bytes) (b [32]byte) {
	if x == nil {
		return
	}
	return bytesToBytes32(*x)
}

func bytesToBytes8(x events.Bytes) (b [8]byte) {
	copy(b[:], x.Bytes())
	return
}

func maybeBytesToBytes8(x *events.Bytes) (b [8]byte) {
	if x == nil {
		return
	}
	return bytesToBytes8(*x)
}
