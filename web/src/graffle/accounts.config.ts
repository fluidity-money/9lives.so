import { Generator } from "graffle/generator";

export default Generator.configure({
  name: "Accounts",
  nameNamespace: "Accounts",
  schema: {
    type: "url",
    url: new URL("https://arb-accounts.superposition.so/"),
    options: {},
  },
  importFormat: "noExtension",
  outputDirPath: "./accounts",
});
