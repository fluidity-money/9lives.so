import type { CodegenConfig } from "@graphql-codegen/cli";
import serverEnv from "./src/config/serverEnv";

const config: CodegenConfig = {
  documents: ["src/**/*.tsx"],
  schema: [serverEnv.GRAPHQL_SCHEMA,'./points-schema.graphqls'],
  ignoreNoDocuments: true,
  generates: {
    // "./src/gql/9lives/": {
    //   schema: serverEnv.GRAPHQL_SCHEMA,
    //   preset: "client",
    //   documents: ["src/**/*.tsx"],
    // },
    // "./src/gql/points/": {
    //   schema: './points-schema.graphqls',
    //   preset: "client",
    //   documents: ["src/**/*.tsx"],
    // },
    "./src/gql/": {
      "preset": 'client'
    }
  },
};

export default config;
