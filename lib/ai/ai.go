// ai: Explicit requests for AI interaction.

package ai

import (
	"fmt"
	"context"
	"encoding/json"

	"github.com/aws/aws-sdk-go-v2/service/lambda"
)

// RequestCategorySuggestions, using the internal RPC endpoint for doing
// so and the private model.
func RequestCategorySuggestions(c *lambda.Client, ctx context.Context, fname, content string) (categories []string, err error) {
	b, err := json.Marshal(struct{
		Content string `json:"content"`
	}{content})
	if err != nil {
		return nil, fmt.Errorf("encoding json: %v", err)
	}
	resp, err := c.Invoke(ctx, &lambda.InvokeInput{
		FunctionName: &fname,
		Payload: b,
	})
	if err != nil {
		return nil, fmt.Errorf("invoke: %v", err)
	}
	if err := json.Unmarshal(resp.Payload, &categories); err != nil {
		return nil, fmt.Errorf("unmarshal resp: %v", err)
	}
	return
}
