package graph

import (
	"context"

	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

func isContractDeployed(c *ethclient.Client, ctx context.Context, addr *ethCommon.Address) (bool, error) {
	code, err := c.CodeAt(ctx, *addr, nil)
	if err != nil {
		return false, err
	}
	return len(code) > 0, nil
}
