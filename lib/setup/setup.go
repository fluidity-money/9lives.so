// setup: contains simple functions for setting up the logging library,
// as well as the database.

package setup

import (
	"log"
	"log/slog"
	"os"
	"runtime/debug"
	"strings"
)

// EnvDebug for enabling debug printing of messages.
const EnvDebug = "SPN_DEBUG"

func init() {
	// Set up the logging to print JSON blobs.
	logLevel := slog.LevelInfo
	if os.Getenv(EnvDebug) != "" {
		logLevel = slog.LevelDebug
	}
	logger := slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: logLevel,
	}))
	var revision string
	if info, ok := debug.ReadBuildInfo(); ok {
		for _, setting := range info.Settings {
			if setting.Key == "vcs.revision" {
				revision = setting.Value
				break
			}
		}
	}
	logger.
		With("revision", revision).
		With("environment", "backend").
		With("command line", strings.Join(os.Args, ",")).
		With("is debug", logLevel == slog.LevelDebug)
	slog.SetDefault(logger)
}

func Exit() {
	os.Exit(1)
}
func Exitf(s string, f ...any) {
	log.Printf(s, f...)
	Exit()
}
