import appConfig from "../../../config";

export async function GET() {
  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjExMDM5MDgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhGMTU4MjZFRTdjYjAzZDEzMEQ4MDM4NzUwNThhQTM5OEIyYTdiNmU0In0",
      payload: "eyJkb21haW4iOiI5bGl2ZXMuc28ifQ",
      signature:
        "MHhhYzkwYjg2OWQyMDFkYzY1OTQ4MTNlYTZjNDQ1YzAwZjM3NzU2ZDg5N2JmZjcxY2MyMzE2MTFiNDI0N2YwZDE0MGM1Y2E1YWExODIzOWY5Y2QyOTljY2U2ZWYxNTcwODdjMTQ1MjBiN2ZlNzY1YjdjYmYyNDE5MThlMWMzNDQzYTFi",
    },
    miniapp: appConfig.frame,
    baseBuilder: {
      ownerAddress: "0x60143A0b1DA42FfEc63ADDB9D05A43485275Ede1",
    },
    frame: appConfig.frame,
  };

  return Response.json(config);
}
