package graph

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"regexp"
	"strings"
	"image"
	_ "image/gif"
	_ "image/png"
	_ "image/jpeg"
)

// MaxImageSizeEncoded is 1 megabyte
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
