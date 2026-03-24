package main

import (
	"bytes"
	"log"
	"text/template"
)

var Tmpl = template.Must(template.New("snapshot").Funcs(template.FuncMap{
	"add": func(a, b int) int {
		return a + b
	},
}).Parse(`
SELECT {{range $i, $c := .Columns}}{{if $i}}, {{end}}{{.}}{{end}} FROM {{.Table}}
{{range $i, $c := .Items}}
{{if $i }} AND{{ else }} WHERE{{ end }} ${{ add $i 1 }} = ${{ add $i 2 }}
{{end}}
ORDER BY {{.OrderColumn}} LIMIT 4000`))

func formatSql(table string, columns []string, orderColumn string, args ...any) string {
	var buf bytes.Buffer
	err := Tmpl.Execute(&buf, struct{
		Table string
		Columns []string
		OrderColumn string
		Items []any
	}{table, columns, orderColumn, args})
	if err != nil {
		log.Fatalf("template: %v", err)
	}
	return buf.String()
}
