import { Generator } from "graffle/generator";

export default Generator.configure({
  name: "Accounts",
  nameNamespace: "Accounts",
  schema: {
    type: "url",
    url: new URL("https://accounts.superposition.so/graphql"),
    options: {},
  },
  importFormat: "noExtension",
  outputDirPath: "./accounts",
});
