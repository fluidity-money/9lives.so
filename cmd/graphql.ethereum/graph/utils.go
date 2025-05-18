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

	"github.com/aws/aws-sdk-go-v2/aws"
	s3manager "github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	ethCommon "github.com/ethereum/go-ethereum/common"
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

// validateReferralSig, returning the signer of the blob given. Currently
// simply returns the sender.
func validateReferralSig(sender, referrer ethCommon.Address, rr, s, v []byte) (ethCommon.Address, error) {
	return sender, nil
}
