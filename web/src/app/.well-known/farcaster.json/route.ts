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
    miniapp: {
      version: "1",
      name: "9lives",
      homeUrl: "https://9lives.so",
      iconUrl: "https://9lives.so/images/icon-farcaster.png",
      splashImageUrl: "https://9lives.so/images/splash-farcaster.png",
      splashBackgroundColor: "#000000",
      subtitle: "Be the winner of the hour, every hour.",
      description:
        "9lives is the most advanced permissionless prediction market. Predict anything!",
      screenshotUrls: [
        "https://ex.co/s1.png",
        "https://ex.co/s2.png",
        "https://ex.co/s3.png",
      ],
      primaryCategory: "finance",
      tags: ["predict", "prediction", "prediction-market", "defi"],
      heroImageUrl: "https://9lives.so/images/dppm-og-image.png",
      tagline: "Predict now",
      ogTitle: "9lives",
      ogDescription: "",
      ogImageUrl: "https://9lives.so/images/dppm-og-image.png",
      noindex: false,
    },
    baseBuilder: {
      ownerAddress: "0x60143A0b1DA42FfEc63ADDB9D05A43485275Ede1",
    },
    frame: appConfig.frame,
  };

  return Response.json(config);
}
