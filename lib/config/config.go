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

// C is configuration for each service, and globally.
type C struct {
	GethUrls        []string
	TimescaleUrls  []string
	FactoryAddress string
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
	factoryAddress := strings.ToLower(os.Getenv("SPN_FACTORY_ADDR"))
	if factoryAddress == "" {
		setup.Exitf("SPN_FACTORY_ADDR not set")
	}
	return C{
		GethUrls:        gethUrls,
		TimescaleUrls:  timescaleUrls,
		FactoryAddress: factoryAddress,
	}
}

func (c C) PickGethUrl() string {
	return c.GethUrls[rand.Intn(len(c.GethUrls))]
}
func (c C) PickTimescaleUrl() string {
	return c.TimescaleUrls[rand.Intn(len(c.TimescaleUrls))]
}
