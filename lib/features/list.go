// list contains the list of features currently supported in the Go codebase.

package features

const (
	// FeatureGraphqlMockGraph by sending mocked data instead of database data.
	FeatureGraphqlMockGraph = "graphql mock demo data"
	// FeatureShouldCheckIfTrackedFirst in the database when inserting a Trading log
	FeatureShouldCheckIfTrackedFirst = "ingestor should track trading first"
)
