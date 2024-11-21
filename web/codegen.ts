import type { CodegenConfig } from "@graphql-codegen/cli";
import serverEnv from "./src/config/serverEnv";

const config: CodegenConfig = {
  documents: ["src/**/*.tsx", "src/**/*.ts"],
  schema: [
    serverEnv.GRAPHQL_SCHEMA,
    "https://points-graph.superposition.so/graphql",
  ],
  ignoreNoDocuments: true,
  generates: {
    "./src/gql/": {
      preset: "client",
    },
  },
};

export default config;
