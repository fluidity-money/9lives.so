// ai: Explicit requests for AI interaction.

package ai

import (
	"fmt"
	"context"
	"strings"
	"encoding/json"
	"encoding/base64"

	"github.com/aws/aws-sdk-go-v2/service/lambda"
)

// RequestCategorySuggestions, using the internal RPC endpoint for doing
// so and the private model.
func RequestCategorySuggestions(c *lambda.Client, ctx context.Context, fname, content string) (categories []string, err error) {
	contentB, err := json.Marshal(struct{
		Content string `json:"content"`
	}{content})
	if err != nil {
		return nil, fmt.Errorf("encoding json: %v", err)
	}
	resp, err := c.Invoke(ctx, &lambda.InvokeInput{
		FunctionName: &fname,
		Payload: contentB,
	})
	if err != nil {
		return nil, fmt.Errorf("invoke: %v", err)
	}
	if err := resp.FunctionError; err != nil {
		return nil, fmt.Errorf("function err: %v", *err)
	}
	p := strings.TrimPrefix(strings.TrimSuffix(string(resp.Payload), `"`), `"`)
	respB, err := base64.StdEncoding.DecodeString(p)
	if err != nil {
		return nil, fmt.Errorf("decoding base64: %v", err)
	}
	if err := json.Unmarshal(respB, &categories); err != nil {
		return nil, fmt.Errorf("unmarshal resp: %v", err)
	}
	return
}
