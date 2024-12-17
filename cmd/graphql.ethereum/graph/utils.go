package graph

import "regexp"

// MaxImageSizeEncoded is 1 megabyte
const MaxImageSizeEncoded = 1024 * 1024

var picRe = regexp.MustCompile(`^data:image/([pP][nN][gG]|[jJ][pP][eE]?[eE]|[gG][iI][fF]|[wW][eE][pP][pP]|[hH][eE][iI][cC]);base64,`)

func replacePicStrPrelude(p string) string {
	return picRe.ReplaceAllString(p, "")
}

func isBadImage(x string) bool {
	switch x {
	case "jpeg", "png", "gif":
		return false
	default:
		return true
	}
}
