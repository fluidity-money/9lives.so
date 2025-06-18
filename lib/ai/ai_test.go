package ai

import (
	"context"
	"os"
	"testing"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	lambdaService "github.com/aws/aws-sdk-go-v2/service/lambda"

	"github.com/stretchr/testify/assert"
)

func TestRequestCategorySuggestions(t *testing.T) {
	awsConf, err := awsConfig.LoadDefaultConfig(context.Background())
	assert.NoError(t, err)
	lambdaClient := lambdaService.NewFromConfig(awsConf)
	fname := os.Getenv("SPN_MISC_AI_FUNCTION_NAME")
	if fname == "" {
		t.FailNow()
	}
	c, err := RequestFromAi(
		lambdaClient,
		context.TODO(),
		fname,
		"categories",
		"Will Bitcoin pass $100,000?",
	)
	assert.NoError(t, err)
	assert.True(t, len(c) > 0)
}
