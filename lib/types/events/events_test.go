package events

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMaybeAddressFromString(t *testing.T) {
	a, err := MaybeAddressFromString("0x6221a9c005f6e47eb398fd867784cacfdcfff4e7")
	assert.NoError(t, err)
	assert.Equal(t, AddressFromString("0x6221a9c005f6e47eb398fd867784cacfdcfff4e7"), *a)
}

func TestEncodingNil(t *testing.T) {
	v, err := NumberFromBig(nil).Value()
	assert.NoError(t, err)
	assert.Equal(t, "0", v)
}
