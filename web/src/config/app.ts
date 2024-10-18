import z from "zod";
import { createThirdwebClient } from "thirdweb";
import clientEnv from "./clientEnv";

const thirdwebClientId = clientEnv.NEXT_PUBLIC_THIRDWEB_ID;

export const thirdwebClient = createThirdwebClient({
  clientId: thirdwebClientId,
});
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
  thirdwebMetadata: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string().url(),
    logoUrl: z.string().url(),
  }),
  thirdwebSponsorGas: z.boolean(),
  cacheRevalidation: z.object({
    homePage: z.number(),
    detailPages: z.number(),
  }),
});

const appVars = appSchema.safeParse({
  metadata,
  thirdwebMetadata: {
    name: metadata.title,
    description: metadata.description,
    url: metadata.metadataBase.href,
    logoUrl: metadata.metadataBase.origin + "/images/logo.svg",
  },
  thirdwebSponsorGas: true,
  cacheRevalidation: {
    homePage: 1000, // 1 day
    detailPages: 1000, // 5 minutes
  },
});

if (!appVars.success) {
  console.error("Invalid app config variables: ", appVars.error.name);
  throw new Error(appVars.error.message);
}

export default appVars.data;
