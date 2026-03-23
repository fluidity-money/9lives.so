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
SELECT * FROM $1
{{range $i, $c := .}}
{{if $i }} AND{{ else }} WHERE{{ end }} ${{ add $i 2 }} = ${{ add $i 3 }}
{{end}}`))

func formatSql(a ...any) string {
	var buf bytes.Buffer
	if err := Tmpl.Execute(&buf, a); err != nil {
		log.Fatalf("template: %v", err)
	}
	return buf.String()
}
