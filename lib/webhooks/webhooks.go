package webhooks

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"text/template"
)

// Webhooks that are addressable by "intention" strings to the url to
// make the send.
type Webhooks map[string]string

func (w Webhooks) Twist(intent, title string, fields []F) error {
	v, ok := w[intent]
	if !ok {
		slog.Warn("Webhook send Twist used, but intention not registered",
			"title", title,
		)
		return nil
	}
	return SendTwist(v, title, fields...)
}

func (w Webhooks) TwistCur(intent, title string, fields []F) func() error {
	return func() error {
		return w.Twist(intent, title, fields)
	}
}

var twistWebhookTmpl = template.Must(template.New("Twist webhook").
	Funcs(template.FuncMap{
		"neatlyprint": func(x any) string {
			switch v := x.(type) {
			case []byte:
				return "0x" + hex.EncodeToString(v)
			default:
				return fmt.Sprintf("%v", v)
			}
		},
	}).
	Parse(`
# {{.Title}}
{{range .Fields}}
## {{.Name }}
{{neatlyprint .Value}}{{end}}
`))

func SendWebhook(url string, r io.Reader) error {
	resp, err := http.Post(url, "application/json", r)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	switch sc := resp.StatusCode; sc {
	case http.StatusOK, http.StatusAccepted, http.StatusNoContent:
		// Do nothing
	default:
		var buf bytes.Buffer
		_, _ = buf.ReadFrom(resp.Body)
		return fmt.Errorf("bad resp, %v: %s", sc, buf.String())
	}
	return nil
}

type F struct {
	Name  string `json:"name"`
	Value any    `json:"value"`
}

func buildTwistJson(title string, fields ...F) (io.Reader, error) {
	var jsonBuf, tmplBuf bytes.Buffer
	err := twistWebhookTmpl.Execute(&tmplBuf, struct {
		Title  string
		Fields []F
	}{title, fields})
	if err != nil {
		return nil, err
	}
	err = json.NewEncoder(&jsonBuf).Encode(struct {
		Content string `json:"content"`
	}{tmplBuf.String()})
	return &jsonBuf, err
}

func SendTwist(url, title string, fields ...F) error {
	r, err := buildTwistJson(title, fields...)
	if err != nil {
		return err
	}
	return SendWebhook(url, r)
}
