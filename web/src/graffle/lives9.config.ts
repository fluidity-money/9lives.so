import { Generator } from "graffle/generator";

export default Generator.configure({
  name: "Lives9",
  nameNamespace: "Lives9",
  schema: {
    type: "sdlFile",
    dirOrFilePath: "../../../cmd/graphql.ethereum/graph/schema.graphqls",
  },
  importFormat: "noExtension",
  outputDirPath: "./lives9",
});
