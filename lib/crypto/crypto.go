package crypto

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"math/big"
	"sort"

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
	Owner, VerifyingContract                        ethCommon.Address
	SpnChainId, OriginatingChainId, Nonce, Deadline *big.Int
	Typ                                             uint8
	Market                                          ethCommon.Address
	MaximumFee, AmountToSpend, MinimumBack          *big.Int
	Referrer                                        ethCommon.Address
	Outcome                                         [8]byte
	V                                               uint8
	R, S                                            *big.Int
}

func EcrecoverPaymasterOperation(op PaymasterOperation) (*ethCommon.Address, error) {
	sig := make([]byte, 65)
	op.R.FillBytes(sig[:32])
	op.S.FillBytes(sig[32:64])
	sig[64] = op.V
	if len(sig) == 65 {
		sig[64] -= 27
	}
	// We set the chain id to be the originating chain so there are
	// no issues involving warnings on the client side for the users.
	chainId := ethMath.HexOrDecimal256(*op.OriginatingChainId)
	typedData := ethApiTypes.TypedData{
		Types: ethApiTypes.Types{
			"EIP712Domain": {
				{Name: "name", Type: "string"},
				{Name: "version", Type: "string"},
				{Name: "chainId", Type: "uint256"},
				{Name: "verifyingContract", Type: "address"},
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
			Version:           op.SpnChainId.String(),
			ChainId:           &chainId,
			VerifyingContract: op.VerifyingContract.String(),
		},
		Message: ethApiTypes.TypedDataMessage{
			"owner":         op.Owner.String(),
			"nonce":         op.Nonce,
			"deadline":      op.Deadline,
			"typ":           new(big.Int).SetInt64(int64(op.Typ)),
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
