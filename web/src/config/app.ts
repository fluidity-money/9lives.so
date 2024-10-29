import z from "zod";

const metadata = {
  title: "9Lives.so",
  description: "The most capital efficient prediction market",
  metadataBase: new URL("https://9lives.so"),
  keywords: [
    "prediction market",
    "bet",
    "stream",
    "cats",
    "onchain",
    "superposition",
    "blockchain",
  ],
};

const appSchema = z.object({
  /**
   * Generated metadata of the web app and wagmi will use this object
   */
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    metadataBase: z.instanceof(URL),
    keywords: z.array(z.string()),
  }),
  cacheRevalidation: z.object({
    homePage: z.number(),
    detailPages: z.number(),
  }),
});

const appVars = appSchema.safeParse({
  metadata,
  cacheRevalidation: {
    homePage: 10,
    detailPages: 10,
  },
});

if (!appVars.success) {
  console.error("Invalid app config variables: ", appVars.error.name);
  throw new Error(appVars.error.message);
}

export default appVars.data;
