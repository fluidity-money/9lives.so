package main

import (
	"bufio"
	"bytes"
	_ "embed"
	"fmt"
	"io"
	"regexp"
	"strings"
	"time"

	"github.com/fluidity-money/9lives.so/lib/types/changelog"

	"github.com/gomarkdown/markdown"
	mdHtml "github.com/gomarkdown/markdown/html"
	mdParser "github.com/gomarkdown/markdown/parser"

	"github.com/microcosm-cc/bluemonday"
)

// LinesLimit to read from the CHANGELOG.md file.
const LinesLimit = 1000

//go:embed CHANGELOG.md
var changelogB []byte

var reHeadline = regexp.MustCompile(`^## ([0-9]+-[0-9]+-20[0-9][0-9])`)

var Changelog []changelog.Changelog

func init() {
	s := bufio.NewScanner(bytes.NewReader(changelogB))
	s.Split(bufio.ScanLines)
	var (
		c   *changelog.Changelog
		buf bytes.Buffer
	)
	appendChangelog := func() {
		// Recreated every time since the package breaks if not.
		p := mdParser.NewWithExtensions(
			mdParser.CommonExtensions |
				mdParser.AutoHeadingIDs |
				mdParser.NoEmptyLineBeforeBlock,
		)
		r := markdown.Render(
			p.Parse(buf.Bytes()),
			mdHtml.NewRenderer(mdHtml.RendererOptions{
				Flags: mdHtml.CommonFlags | mdHtml.HrefTargetBlank,
			}),
		)
		buf.Reset()
		html := bluemonday.UGCPolicy().SanitizeBytes(r)
		c.HtmlContent = string(html)
		Changelog = append(Changelog, *c)
	}
	for i := 0; i < LinesLimit && s.Scan(); i++ {
		t := s.Text()
		m := reHeadline.FindStringSubmatchIndex(t)
		if len(m) == 4 {
			if c != nil {
				appendChangelog()
			}
			c = new(changelog.Changelog)
			c.Title = strings.TrimSpace(t[m[3]:])
			var err error
			c.Time, err = time.Parse("02-01-2006", t[m[2]:m[3]])
			if err != nil {
				panic(fmt.Sprintf("read changelog %v: %v", i+1, err))
			}
		} else {
			fmt.Fprintf(&buf, "%s\n", t)
		}
	}
	switch err := s.Err(); err {
	case io.EOF, nil:
		// Do nothing
	default:
		panic(fmt.Sprintf("read changelog: %v", err))
	}
	if c != nil {
		appendChangelog()
	}
}
