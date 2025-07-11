package sudoswap

import "testing"

func TestAbi(t *testing.T) {
	if abiErr != nil {
		t.Fatalf("abi: %v", abiErr)
	}
}
