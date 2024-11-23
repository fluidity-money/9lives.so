// newsfeed.cron: take a list of news items from stdin, and write each of
// them to the database to be randomly chosen from for the day.

package main

import (
	"bufio"
	"io"
	"log/slog"
	"os"

	"github.com/fluidity-money/9lives.so/lib/types/newsfeed"
	"github.com/fluidity-money/9lives.so/lib/setup"
	"github.com/fluidity-money/9lives.so/lib/config"

	"gorm.io/gorm"
	gormSlog "github.com/orandin/slog-gorm"
	"gorm.io/driver/postgres"
)

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
	r := bufio.NewReader(os.Stdin)
	tx := db.Begin()
	var i int
L:
	for i = 0; ; i++ {
		l, _, err := r.ReadLine()
		switch err {
		case nil:
			// Do nothing
		case io.EOF:
			break L
		default:
			setup.Exitf("read line %v: %v", i+1, err)
		}
		if len(l) == 0 {
			continue
		}
		slog.Debug("Inserting headline",
			"headline", string(l),
			"line", i+1,
		)
		err = tx.Table("ninelives_newsfeed_1").Create(newsfeed.Newsfeed{
			Headline: string(l),
		}).Error
		if err != nil {
			setup.Exitf("headline insert %v: %v", i+1, err)
		}
	}
	if i == 0 { // Just quit if this is the case.
		slog.Debug("No lines read")
		return
	}
	if err := tx.Commit().Error; err != nil {
		setup.Exitf("commit tx: %v", err)
	}
}
