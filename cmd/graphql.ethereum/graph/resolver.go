package graph

import (
	"gorm.io/gorm"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/types/changelog"

	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"

	s3manager "github.com/aws/aws-sdk-go-v2/feature/s3/manager"
)

type Resolver struct {
	DB                 *gorm.DB              // db used to look up any fields that are missing from a request.
	F                  features.F            // features to have enabled when requested
	Geth               *ethclient.Client     // needed to do lookups with geth
	C                  config.C              // config for connecting to the right endpoints
	FactoryAddr        ethCommon.Address     // address of the factory contract
	InfraMarketAddr    ethCommon.Address     // address of the infra market
	BeautyContestAddr  ethCommon.Address     // address of the beauty contest (opinion poll)
	SarpAiAddr         ethCommon.Address     // address of SARP AI
	ChangelogItems     []changelog.Changelog // the changelog for this.
	S3UploadBucketName string                // bucket for s3 images
	S3UploadManager    *s3manager.Uploader   // uploader for S3
	PicturesUriBase    string                // base URL for image hosting domain
}
