import { Generator } from "graffle/generator";

export default Generator.configure({
  name: "Points",
  nameNamespace: "Points",
  schema: {
    type: "url",
    url: new URL("https://points-graph.superposition.so/graphql"),
    options: {},
  },
  outputDirPath: "./points",
});
