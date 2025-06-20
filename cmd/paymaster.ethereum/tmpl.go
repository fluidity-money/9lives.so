package main

import "text/template"

var LogIdsTmpl = template.Must(
	template.New("track id results").Parse(`
WITH function_calls AS (
	SELECT
		poll_id,
		success,
		ninelives_paymaster_track_result_1(poll_id, success)
	FROM (
		VALUES {{range $i, $v := .}}($i, $v){{end}}
	) AS params(poll_id, success)
)
SELECT poll_id, success FROM function_calls;
`))
