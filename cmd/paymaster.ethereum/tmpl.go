package main

import (
	"database/sql"
	"strings"
	"text/template"
)

var logIdsTmpl = template.Must(
	template.New("track id results").
		Funcs(template.FuncMap{
			"add": func(x, y int) int { return x + y },
			"formatHash": func(hash sql.NullString) string {
				if hash.Valid {
					return "'" + hash.String + "'"
				}
				return "NULL"
			},
		}).
		Parse(`
WITH function_calls AS (
	SELECT
		poll_id,
		success,
		hash,
		ninelives_paymaster_track_result_2(poll_id, success, hash) as result
	FROM (
		VALUES {{range $i, $v := .}}({{ .Id}}, {{ .Success }}, {{formatHash .Hash}}){{if not (eq (add $i 1) (len $))}},{{end}}{{end}}
	) AS params(poll_id, success, hash)
)
SELECT poll_id, success FROM function_calls;
`))

type LogId struct {
	Id      int
	Success bool
	Hash    sql.NullString
}

func GenLogIds(x ...LogId) string {
	var buf strings.Builder
	if err := logIdsTmpl.Execute(&buf, x); err != nil {
		panic(err)
	}
	return buf.String()
}
