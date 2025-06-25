import appConfig from "../../../config";

export async function GET() {
  const config = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    frame: appConfig.frame,
  };

  return Response.json(config);
}
