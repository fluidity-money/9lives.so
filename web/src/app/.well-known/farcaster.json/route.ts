import appConfig from "../../../config";

export async function GET() {
  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjE5Nzc4LCJ0eXBlIjoiYXV0aCIsImtleSI6IjB4NjVENUIxOWY5YzUzMDJlY0Y1YTVjM0Y1OTc1MUY0Mjk0M0EwMDc2YSJ9",
      payload: "eyJkb21haW4iOiI5bGl2ZXMuc28ifQ",
      signature:
        "By3HTQIP1T8XsTXTWmS59JUbYHLVcl+5Xf35D8kc291MMjvGkSOvejueGB4u4ViWDYFpXRqSS/Uy/xBYHlupdBw=",
    },
    frame: appConfig.frame,
  };

  return Response.json(config);
}
