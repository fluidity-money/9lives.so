package graph

import (
	_ "embed"
	"testing"

	"github.com/stretchr/testify/assert"
)

var (
	//go:embed file-validation-png.base64
	pngPic string
	//go:embed file-validation-jpg.base64
	jpgPic string
)

func TestPicStripJpeg(t *testing.T) {
	assert.Equal(t, "", picRe.ReplaceAllString("data:image/jpeg;base64,", ""))
}

func TestPicValidityPng(t *testing.T) {
	// We're just going to assume this is fine if this comes up nil.
	_, err := decodeAndCheckPictureValidity(pngPic)
	assert.Nil(t, err)
}

func TestPicValidityJpeg(t *testing.T) {
	// We're just going to assume this is fine if this comes up nil.
	_, err := decodeAndCheckPictureValidity(jpgPic)
	assert.Nil(t, err)
}
