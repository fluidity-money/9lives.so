// config: contains configuration behaviour that should be configured
// using environment variables that're global.
//

package config

import (
	"math/rand"
	"os"
	"strings"

	"github.com/fluidity-money/9lives.so/lib/setup"
)

// DefaultChainId to use for all interactions.
const DefaultChainId = 55244

// C is configuration for each service, and globally.
type C struct {
	GethUrls                              []string
	TimescaleUrls                         []string
	FactoryAddress, InfraMarketAddress    string
	BeautyContestAddress, SarpAiAddress   string
	LockupAddress, SarpAiSignallerAddress string
	LifiDiamondAddress                    string
	ChainId                               int
}

// Get config by querying environment variables.
func Get() C {
	/* Global RPC configuration. */
	gethUrl := os.Getenv("SPN_SUPERPOSITION_URL")
	if gethUrl == "" {
		setup.Exitf("SPN_SUPERPOSITION_URL not set")
	}
	timescaleUrl := os.Getenv("SPN_TIMESCALE")
	if timescaleUrl == "" {
		setup.Exitf("SPN_TIMESCALE not set")
	}
	gethUrls := strings.Split(gethUrl, ",")
	timescaleUrls := strings.Split(timescaleUrl, ",")
	factoryAddr := strings.ToLower(os.Getenv("SPN_FACTORY_ADDR"))
	if factoryAddr == "" {
		setup.Exitf("SPN_FACTORY_ADDR not set")
	}
	infraMarketAddr := strings.ToLower(os.Getenv("SPN_INFRA_MARKET_ADDR"))
	if infraMarketAddr == "" {
		setup.Exitf("SPN_INFRA_MARKET_ADDR not set")
	}
	beautyContestAddr := strings.ToLower(os.Getenv("SPN_BEAUTY_CONTEST_ADDR"))
	if beautyContestAddr == "" {
		setup.Exitf("SPN_BEAUTY_CONTEST_ADDR not set")
	}
	sarpAiAddr := strings.ToLower(os.Getenv("SPN_SARP_AI_ADDR"))
	if sarpAiAddr == "" {
		setup.Exitf("SPN_SARP_AI_ADDR not set")
	}
	lockupAddr := strings.ToLower(os.Getenv("SPN_LOCKUP_PROXY_ADDR"))
	if lockupAddr == "" {
		setup.Exitf("SPN_LOCKUP_PROXY_ADDR not set")
	}
	sarpAiSignallerAddr := strings.ToLower(os.Getenv("SPN_SARP_AI_SIGNALLER_ADDR"))
	if sarpAiSignallerAddr == "" {
		setup.Exitf("SPN_SARP_AI_SIGNALLER_ADDR not set")
	}
	lifiDiamondAddr := strings.ToLower(os.Getenv("SPN_LIFI_DIAMOND_ADDR"))
	if lifiDiamondAddr == "" {
		setup.Exitf("SPN_LIFI_DIAMOND_ADDR not set")
	}
	return C{
		GethUrls:               gethUrls,
		TimescaleUrls:          timescaleUrls,
		FactoryAddress:         factoryAddr,
		InfraMarketAddress:     infraMarketAddr,
		BeautyContestAddress:   beautyContestAddr,
		SarpAiAddress:          sarpAiAddr,
		LockupAddress:          lockupAddr,
		SarpAiSignallerAddress: sarpAiSignallerAddr,
		LifiDiamondAddress:     lifiDiamondAddr,
		ChainId:                DefaultChainId,
	}
}

func (c C) PickGethUrl() string {
	return c.GethUrls[rand.Intn(len(c.GethUrls))]
}
func (c C) PickTimescaleUrl() string {
	return c.TimescaleUrls[rand.Intn(len(c.TimescaleUrls))]
}
