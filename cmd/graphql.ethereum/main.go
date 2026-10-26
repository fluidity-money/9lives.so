package main

//go:generate go run github.com/99designs/gqlgen generate

import (
	"context"
	"math/big"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/fluidity-money/9lives.so/lib/config"
	"github.com/fluidity-money/9lives.so/lib/features"
	"github.com/fluidity-money/9lives.so/lib/setup"

	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"

	"github.com/coreos/go-systemd/v22/activation"

	ethCommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"

	gormSlog "github.com/orandin/slog-gorm"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	// UploadTradingPicsUrl is the basis for file upload for the webapp.
	UploadTradingPicsUrl = "https://pictures.9lives.so"

	// S3UploadBucketName to use for uploads to AWS S3.
	S3UploadBucketName = "pictures.9lives.so"
)

const (
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
		r.Header.Get("X-Admin-Secret"),
	)
	ipAddrs := strings.Split(r.Header.Get("X-Forwarded-For"), ",")
	var ipAddr string
	if len(ipAddrs) > 0 {
		ipAddr = ipAddrs[0]
	}
	ctx = context.WithValue(ctx, "ip addr", ipAddr)
	m.srv.ServeHTTP(w, r.WithContext(ctx))
}

func main() {
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
			DB:                      db,
			F:                       features.Get(),
			Geth:                    geth,
			C:                       config,
			FactoryAddr:             ethCommon.HexToAddress(config.FactoryAddress),
			InfraMarketAddr:         ethCommon.HexToAddress(config.InfraMarketAddress),
			BeautyContestAddr:       ethCommon.HexToAddress(config.BeautyContestAddress),
			SarpAiAddr:              ethCommon.HexToAddress(config.SarpAiAddress),
			PaymasterAddr:           ethCommon.HexToAddress(config.PaymasterAddress),
			AdminSecret:             adminSecret,
			PaymasterMinimumUSDCGas: paymasterMinFee,
			PaymasterSenderAddr:     ethCommon.HexToAddress(paymasterSenderAddr),
			PriceResolverAddr:       ethCommon.HexToAddress(config.PriceResolverAddress),
		},
	}))
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.SetQueryCache(lru.New(1000))
	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New(100),
	})
	http.Handle("/", corsMiddleware{srv})
	http.Handle("/playground", playground.Handler("9lives.so playground", "/"))
	l, err := activation.Listeners()
	if err != nil {
		setup.Exitf("listeners: %v", err)
	}
	var wg sync.WaitGroup
	for _, l := range l {
		wg.Go(func() {
			panic(http.Serve(l, nil))
		})
	}
	wg.Wait()
}
