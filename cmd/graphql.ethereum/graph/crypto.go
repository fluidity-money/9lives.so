package graph

import (
	"bytes"
	"crypto/subtle"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"sort"

	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"

	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph/model"
)

type AuthToken struct {
	TypedData string `json:"typedData"`
	Signature string `json:"signature"`
	Address   string `json:"address"`
}

func verifyAuthTokenAddress(data string) (string, error) {
	var authToken AuthToken
	if err := json.Unmarshal([]byte(data), &authToken); err != nil {
		return "", fmt.Errorf("unmarshal auth token: %w", err)
	}

	signature, err := hexutil.Decode(authToken.Signature)
	if err != nil {
		return "", fmt.Errorf("decode signature: %w", err)
	}
	// fmt.Println("SIG:", hexutil.Encode(signature))

	typedDataBytes, err := base64.StdEncoding.DecodeString(authToken.TypedData)
	if err != nil {
		return "", fmt.Errorf("decode typed data: %w", err)
	}

	typedData := apitypes.TypedData{}
	if err := json.Unmarshal(typedDataBytes, &typedData); err != nil {
		return "", fmt.Errorf("unmarshal typed data: %w", err)
	}

	// EIP-712 typed data marshalling
	domainSeparator, err := typedData.HashStruct("EIP712Domain", typedData.Domain.Map())
	if err != nil {
		return "", fmt.Errorf("eip712domain hash struct: %w", err)
	}
	typedDataHash, err := typedData.HashStruct(typedData.PrimaryType, typedData.Message)
	if err != nil {
		return "", fmt.Errorf("primary type hash struct: %w", err)
	}

	// add magic string prefix
	rawData := []byte(fmt.Sprintf("\x19\x01%s%s", string(domainSeparator), string(typedDataHash)))
	sighash := crypto.Keccak256(rawData)
	// fmt.Println("SIG HASH:", hexutil.Encode(sighash))

	// update the recovery id
	// https://github.com/ethereum/go-ethereum/blob/55599ee95d4151a2502465e0afc7c47bd1acba77/internal/ethapi/api.go#L442
	signature[64] -= 27

	// get the pubkey used to sign this signature
	sigPubkey, err := crypto.Ecrecover(sighash, signature)
	if err != nil {
		return "", fmt.Errorf("ecrecover: %w", err)
	}
	// fmt.Println("SIG PUBKEY:", hexutil.Encode(sigPubkey))

	// get the address to confirm it's the same one in the auth token
	pubkey, err := crypto.UnmarshalPubkey(sigPubkey)
	if err != nil {
		return "", fmt.Errorf("error: %w", err)
	}
	address := crypto.PubkeyToAddress(*pubkey)
	// fmt.Println("ADDRESS:", address.Hex())

	// verify the signature (not sure if this is actually required after ecrecover)
	signatureNoRecoverID := signature[:len(signature)-1]
	verified := crypto.VerifySignature(sigPubkey, sighash, signatureNoRecoverID)
	if !verified {
		return "", errors.New("verification failed")
	}
	// fmt.Println("VERIFIED:", verified)

	tokenAddress := ethCommon.HexToAddress(authToken.Address)
	if subtle.ConstantTimeCompare(address.Bytes(), tokenAddress.Bytes()) == 0 {
		return "", errors.New("address mismatch")
	}

	return address.Hex(), nil
}
