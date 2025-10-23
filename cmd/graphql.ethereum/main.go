package main

//go:generate go run github.com/99designs/gqlgen generate

import (
	"context"
	"math/big"
	"net/http"
	"os"
	"strings"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/setup"

	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"

	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"

	gormSlog "github.com/orandin/slog-gorm"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/aws/aws-lambda-go/lambda"

	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	s3manager "github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	lambdaService "github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const (
	// UploadTradingPicsUrl is the basis for file upload for the webapp.
	UploadTradingPicsUrl = "https://pictures.9lives.so"

	// S3UploadBucketName to use for uploads to AWS S3.
	S3UploadBucketName = "pictures.9lives.so"
)

const (
	// EnvBackendType to use to listen the server with, (http|lambda).
	EnvBackendType = "SPN_LISTEN_BACKEND"

	// EnvListenAddr to listen the HTTP server on.
	EnvListenAddr = "SPN_LISTEN_ADDR"

	// EnvLambdaMiscAiBackend to use for frontend-related requests where
	// existing infra is inappropriate.
	EnvLambdaMiscAiBackend = "SPN_MISC_AI_FUNCTION_NAME"

	// EnvAdminSecret to use for using any trusted paths (currently, only
	// campaign explanation).
	EnvAdminSecret = "SPN_ADMIN_SECRET"

	// EnvPaymasterMinimumFee to use as the minimum amount for maximum
	// fee. Should be 200000 for 20 cents (the current fee for a sell).
	EnvPaymasterMinimumFee = "SPN_PAYMASTER_MIN_FEE"

	// EnvPaymasterSenderAddr that's used for simulating Paymaster interactions
	// at the graph level.
	EnvPaymasterSenderAddr = "SPN_PAYMASTER_SENDER_ADDR"
)

// ChangelogLen to send to the user at max on request for the changelog endpoint.
const ChangelogLen = 10

type corsMiddleware struct{ srv *handler.Server }

func (m corsMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "*")
	ctx := context.WithValue(
		r.Context(),
		"admin secret",
		r.Header.Get("Authorization"),
	)
	ipAddrs := strings.Split(r.Header.Get("X-Forwarded-For"), ",")
	var ipAddr string
	if len(ipAddrs) > 0 {
		ipAddr = ipAddrs[0]
	}
	ctx = context.WithValue(r.Context(), "ip addr", ipAddr)
	m.srv.ServeHTTP(w, r.WithContext(ctx))
}

func main() {
	defer setup.Flush()
	config := config.Get()
	db, err := gorm.Open(postgres.Open(config.PickTimescaleUrl()), &gorm.Config{
		DisableAutomaticPing: true,
		Logger:               gormSlog.New(), // Use default slog
	})
	if err != nil {
		setup.Exitf("database open: %v", err)
	}
	geth, err := ethclient.Dial(config.PickGethUrl())
	if err != nil {
		setup.Exitf("geth open: %v", err)
	}
	defer geth.Close()
	awsConf, err := awsConfig.LoadDefaultConfig(context.Background())
	if err != nil {
		setup.Exitf("aws config: %v", err)
	}
	s3Client := s3.NewFromConfig(awsConf)
	lambdaClient := lambdaService.NewFromConfig(awsConf)
	f := features.Get()
	adminSecret := os.Getenv(EnvAdminSecret)
	if f.Is(features.FeatureAdminFeaturesEnabled) && adminSecret == "" {
		setup.Exitf("admin feature is enabled, but secret not set")
	}
	paymasterMinFee, ok := new(big.Int).SetString(os.Getenv(EnvPaymasterMinimumFee), 10)
	if !ok {
		setup.Exitf("SPN_PAYMASTER_MIN_FEE incorrectly set")
	}
	paymasterSenderAddr := os.Getenv(EnvPaymasterSenderAddr)
	if paymasterSenderAddr == "" {
		setup.Exitf("SPN_PAYMASTER_SENDER_ADDR not set")
	}
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{
			DB:                 db,
			F:                  features.Get(),
			Geth:               geth,
			C:                  config,
			FactoryAddr:        ethCommon.HexToAddress(config.FactoryAddress),
			InfraMarketAddr:    ethCommon.HexToAddress(config.InfraMarketAddress),
			BeautyContestAddr:  ethCommon.HexToAddress(config.BeautyContestAddress),
			SarpAiAddr:         ethCommon.HexToAddress(config.SarpAiAddress),
			PaymasterAddr:      ethCommon.HexToAddress(config.PaymasterAddress),
			ChangelogItems:     Changelog[:min(ChangelogLen, len(Changelog))],
			S3UploadBucketName: S3UploadBucketName,
			S3UploadManager: s3manager.NewUploader(s3Client, func(u *s3manager.Uploader) {
				u.PartSize = 10 * 1024 * 1024
			}),
			PicturesUriBase:         UploadTradingPicsUrl,
			LambdaClient:            lambdaClient,
			LambdaMiscAiBackendName: os.Getenv(EnvLambdaMiscAiBackend),
			AdminSecret:             adminSecret,
			PaymasterMinimumUSDCGas: paymasterMinFee,
			PaymasterSenderAddr:     ethCommon.HexToAddress(paymasterSenderAddr),
			PriceResolverAddr: ethCommon.HexToAddress(config.PriceResolverAddr)
		},
	}))
	http.Handle("/", corsMiddleware{srv})
	http.Handle("/playground", playground.Handler("9lives.so playground", "/"))
	switch typ := os.Getenv(EnvBackendType); typ {
	case "lambda":
		lambda.Start(httpadapter.NewV2(http.DefaultServeMux).ProxyWithContext)
	case "http":
		err := http.ListenAndServe(os.Getenv(EnvListenAddr), nil)
		setup.Exitf( // This should only return if there's an error.
			"err listening, %#v not set?: %v",
			EnvListenAddr,
			err,
		)
	default:
		setup.Exitf(
			"unexpected listen type: %#v, use either (lambda|http) for SPN_LISTEN_BACKEND",
			typ,
		)
	}
}
