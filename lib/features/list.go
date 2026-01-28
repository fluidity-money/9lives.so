// list contains the list of features currently supported in the Go codebase.

package features

const (
	// FeatureGraphqlMockGraph by sending mocked data instead of database data.
	FeatureGraphqlMockGraph = "graphql mock demo data"

	// FeatureShouldCheckIfTrackedFirst in the database when inserting a Trading log
	FeatureShouldCheckIfTrackedFirst = "ingestor should track trading first"

	// FeatureUseAIForCategories to be enabled if the graph should use AI to check categories.
	FeatureUseAIForCategories = "ai for categories"

	// FeatureAdminFeaturesEnabled should be enabled if the admin features can be used with a secret.
	FeatureAdminFeaturesEnabled = "admin features are enabled"

	// FeatureReferrerNeedsToVerify using a signature
	FeatureReferrerNeedsToVerify = "referrer needs to verify"

	// FeatureUseAiForCheckingIfCampaignMakesSense on every campaign listing in lambda.
	FeatureUseAiForCheckingIfCampaignMakesSense = "ai for asking if a campaign makes sense"

	// FeatureShouldPriceCalldata to test whether the maximum fee is accurate
	// before submittting with Paymaster.
	FeatureShouldPriceCalldata = "paymaster should price"

	// FeatureShouldCheckErc20Balance for Paymaster operation.
	FeatureShouldCheckErc20Balance = "paymaster graphql should check erc20"

	// FeatureShouldCheckPaymasterNonce before accepting calldata for the Paymaster.
	FeatureShouldCheckPaymasterNonce = "paymaster should check nonce"

	// FeatureShouldValidatePaymasterSig before accepting calldata to the graph for Paymaster.
	FeatureShouldValidatePaymasterSig = "paymaster should check sig"

	// FeatureShouldValidateMarketExistence before accepting a request to the Paymaster.
	FeatureShouldValidateMarketExistence = "paymaster should check trading addr"

	// FeatureShouldSimulateSubmission will simulate a multicall transaction using the Paymaster
	// sender before accepting a transaction from the end user.
	FeatureShouldSimulateSubmission = "paymaster should simulate submission"

	// FeatureShouldReportPaymasterFailure is enabled if we want to alert via Twist if an error
	// took place simulating a Paymaster transaction, including details.
	FeatureShouldReportPaymasterFailure = "paymaster should report failure"

	// FeatureDppmMarketsMustBeMadeByAdmin only using the admin secret.
	FeatureDppmMarketsMustBeMadeByAdmin = "dppm markets must be made by admin"

	// FeatureCategoryOverridesShouldBeMadeByAdmin are the only users that can override categories.
	FeatureCategoryOverridesShouldBeMadeByAdmin = "category overrides should be made by admin"

	// FeaturePaymasterEmergencyWipe should wipe the paymaster poll table of
	// troublesome requests in a worst case scenario.
	FeaturePaymasterEmergencyWipe = "paymaster should wipe emergency on repeated errors"

	// FeatureFilterTables should only send tables if they're filtered for in the UI.
	FeatureFilterTables = "websocket should filter tables"

	// FeatureSnapshotOnConnect should send on connection to the websocket the snapshot.
	FeatureSnapshotOnConnect = "should send the snapshot on connection"

	// FeatureIsSnapshotOnRequest should only send the snapshot on request.
	FeatureIsSnapshotOnRequest = "should only send the snapshot on request"
)
