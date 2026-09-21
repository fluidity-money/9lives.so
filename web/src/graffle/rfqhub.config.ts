import { Generator } from "graffle/generator";

export default Generator.configure({
  name: "Rfqhub",
  nameNamespace: "Rfqhub",
  schema: {
    type: "sdlFile",
    dirOrFilePath: "../../../../rfqhub.9lives.so/cmd/graph/schema.graphqls",
  },
  importFormat: "noExtension",
  outputDirPath: "./rfqhub",
});