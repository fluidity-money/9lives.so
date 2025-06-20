package main

import (
	"strings"
	"text/template"
)

var logIdsTmpl = template.Must(
	template.New("track id results").
		Funcs(template.FuncMap{
			"add": func(x, y int) int { return x + y },
		}).
		Parse(`
WITH function_calls AS (
	SELECT
		poll_id,
		success,
		ninelives_paymaster_track_result_1(poll_id, success)
	FROM (
		VALUES {{range $i, $v := .}}({{ .Id}}, {{ .Success }}){{if not (eq (add $i 1) (len $))}},{{end}}{{end}}
	) AS params(poll_id, success)
)
SELECT poll_id, success FROM function_calls;
`))

type LogId struct {
	Id      int
	Success bool
}

func GenLogIds(x ...LogId) string {
	var buf strings.Builder
	if err := logIdsTmpl.Execute(&buf, x); err != nil {
		panic(err)
	}
	return buf.String()
}
