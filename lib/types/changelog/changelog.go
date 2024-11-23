package changelog

import "time"

type Changelog struct {
	Title string
	Time time.Time
	HtmlContent string
}
