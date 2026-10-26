package graph

import (
	"math/big"

	"gorm.io/gorm"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/types/changelog"

	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"

	"github.com/aws/aws-sdk-go-v2/service/lambda"
)

type Resolver struct {
	DB                      *gorm.DB              // db used to look up any fields that are missing from a request.
	F                       features.F            // features to have enabled when requested
	Geth                    *ethclient.Client     // needed to do lookups with geth
	C                       config.C              // config for connecting to the right endpoints
	FactoryAddr             ethCommon.Address     // address of the factory contract
	InfraMarketAddr         ethCommon.Address     // address of the infra market
	BeautyContestAddr       ethCommon.Address     // address of the beauty contest (opinion poll)
	SarpAiAddr              ethCommon.Address     // address of SARP AI
	PaymasterAddr           ethCommon.Address     // address of the Paymaster
	PaymasterSenderAddr     ethCommon.Address     // public key address of the Paymaster sender
	ChangelogItems          []changelog.Changelog // the changelog for this.
	LambdaClient            *lambda.Client        // Lambda client
	AdminSecret             string                // administrative secret needed for some admin paths
	PaymasterMinimumUSDCGas *big.Int              // minimum to ask user for in maximum gas
	PriceResolverAddr       ethCommon.Address     // price resolver oracle address
}
