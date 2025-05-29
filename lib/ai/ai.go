// ai: Explicit requests for AI interaction.

package ai

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/lambda"
)

// RequestFromAI with the AI resolver using the Lambda given.
func RequestFromAi(c *lambda.Client, ctx context.Context, fname, key, content string) (categories []string, err error) {
	contentB, err := json.Marshal(struct {
		Key     string `json:"key"`
		Content string `json:"content"`
	}{key, content})
	if err != nil {
		return nil, fmt.Errorf("encoding json: %v", err)
	}
	resp, err := c.Invoke(ctx, &lambda.InvokeInput{
		FunctionName: &fname,
		Payload:      contentB,
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
