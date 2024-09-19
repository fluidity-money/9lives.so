import type { CodegenConfig } from "@graphql-codegen/cli";
import serverEnv from "@/config/serverEnv";

const config: CodegenConfig = {
  schema: serverEnv.GRAPHQL_SCHEMA,
  documents: ["src/**/*.tsx"],
  ignoreNoDocuments: true,
  generates: {
    "./src/gql/": {
      preset: "client",
    },
  },
};

export default config;
