package graph

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/url"
	"regexp"
	"strings"

	paymasterType "github.com/fluidity-money/9lives.so/lib/types/paymaster"
	paymasterMisc "github.com/fluidity-money/9lives.so/lib/misc/paymaster"
	"github.com/fluidity-money/9lives.so/lib/crypto"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3manager "github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum"
	ethCrypto "github.com/ethereum/go-ethereum/crypto"
)

// MaxImageSizeEncoded is 2 megabytes
const MaxImageSizeEncoded = 1024 * 1024 * 2

var picRe = regexp.MustCompile(`^data:image/([pP][nN][gG]|[jJ][pP][eE]?[gG]|[gG][iI][fF]|[wW][eE][pP][pP]|[hH][eE][iI][cC]);base64,`)

func replacePicStrPrelude(p string) string {
	return picRe.ReplaceAllString(p, "")
}

// decodeAndCheckPictureValidity strips the beginning of a base64
// preamble, attempts to decode it, then checks the size of the decoded
// form to see if it's on par with our expectations with size into a
// duplicated buffer. Then it decodes the image config to see if the
// picture is one of our accepted file types. Then it returns the
// duplicated buffer for reading to a file.
func decodeAndCheckPictureValidity(img string) (out io.Reader, err error) {
	body := base64.NewDecoder(
		base64.StdEncoding,
		strings.NewReader(replacePicStrPrelude(img)),
	)
	var buf bytes.Buffer
	if _, err := buf.ReadFrom(body); err != nil {
		return nil, fmt.Errorf("read from: %v", err)
	}
	if buf.Len() > MaxImageSizeEncoded {
		return nil, fmt.Errorf("outcome picture too large")
	}
	buf2 := buf
	_, imageType, err := image.DecodeConfig(&buf2)
	if err != nil {
		return nil, fmt.Errorf("decode config: %v", err)
	}
	switch imageType {
	case "jpeg", "png", "gif":
		// Do nothing
	default:
		return nil, fmt.Errorf("bad image: %v", imageType)
	}
	return &buf, nil
}

func uploadTradingPicMaybePrecommit(ctx context.Context, uploadBucketName, picturesUri string, umgr *s3manager.Uploader, img, tradingAddrStr string, isNotPrecommit bool) (string, error) {
	// Upload the image for the base to S3, so we can serve it later,
	// start by unpacking the base64. This should also blow up if this
	// is bad base64.
	buf, err := decodeAndCheckPictureValidity(img)
	if err != nil {
		return "", fmt.Errorf("failed to decode: %v", err)
	}
	tradingPicKey := tradingAddrStr + "-base"
	if isNotPrecommit {
		_, err = umgr.Upload(ctx, &s3.PutObjectInput{
			Bucket: aws.String(uploadBucketName),
			Key:    aws.String(tradingPicKey),
			Body:   buf,
		})
		if err != nil {
			return "", fmt.Errorf("uploading image: %v", err)
		}
	}
	concatPicUrl, err := url.JoinPath(picturesUri, tradingPicKey)
	if err != nil {
		return "", fmt.Errorf("error joining path: %v", err)
	}
	return concatPicUrl, nil
}

func validateReferralSig(sender, referrer ethCommon.Address, r, s, v []byte) (ethCommon.Address, error) {
	if len(r) != 32 || len(s) != 32 || len(v) != 1 {
		return ethCommon.Address{}, fmt.Errorf("invalid signature parameters")
	}
	message := strings.ToLower(referrer.Hex())
	prefix := fmt.Sprintf("\x19Ethereum Signed Message:\n%d", len(message))
	msg := prefix + message
	msgHash := ethCommon.BytesToHash(ethCrypto.Keccak256([]byte(msg)))
	sig := append(r, append(s, v[0])...)
	pubKey, err := ethCrypto.SigToPub(msgHash.Bytes(), sig)
	if err != nil {
		return ethCommon.Address{}, fmt.Errorf("recovering signature: %v", err)
	}
	recoveredAddr := ethCrypto.PubkeyToAddress(*pubKey)
	if recoveredAddr != sender {
		return ethCommon.Address{}, fmt.Errorf("signature does not match sender")
	}
	return recoveredAddr, nil
}

func simPaymasterMulticall(ctx context.Context, c *ethclient.Client, paymasterSenderAddr, paymasterContractAddr ethCommon.Address, p paymasterType.Poll) (bool, error) {
	cd, err := paymasterMisc.Abi.Pack("multicall", []crypto.PaymasterOperation{
		crypto.PollToPaymasterOperation(p),
	})
	if err != nil {
		return false, fmt.Errorf("pack multicall: %v", err)
	}
	callRes, err := c.CallContract(ctx, ethereum.CallMsg{
		To:   &paymasterContractAddr,
		From: paymasterSenderAddr,
		Data: cd,
	}, nil)
	i, err := paymasterMisc.Abi.Unpack("multicall", callRes)
	if err != nil {
		return false, fmt.Errorf("pack multicall")
	}
	switch v := i[0].(type) {
	case []bool:
		if len(v) == 0 {
			return false, fmt.Errorf("response was empty")
		}
		return v[0], nil
	default:
		return false, fmt.Errorf("bad type: %T", i[0])
	}
}
