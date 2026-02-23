import { Generator } from "graffle/generator";

export default Generator.configure({
  name: "Accounts",
  nameNamespace: "Accounts",
  schema: {
    type: "url",
    url: new URL(
      "https://ibbkvq4cr2ctxse5wck3gtvf6m0jrqzh.lambda-url.ap-southeast-2.on.aws/",
    ),
    options: {},
  },
  importFormat: "noExtension",
  outputDirPath: "./accounts",
});
