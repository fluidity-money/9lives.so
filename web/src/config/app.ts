import z from "zod";
import { farcasterChains } from "./chains";
enum InfraMarketState {
  Callable,
  Closable,
  Whinging,
  Predicting,
  Revealing,
  Declarable,
  Sweeping,
  Closed,
  Loading,
}
const metadata = {
  title: "9Lives.so",
  description: "The most advanced prediction market",
  metadataBase: new URL("https://9lives.so"),
  keywords: [
    "prediction market",
    "bet",
    "stream",
    "cats",
    "onchain",
    "superposition",
    "blockchain",
    "arbitrum",
    "web3",
  ],
};
const infraMarketStateTitles: Record<InfraMarketState, string> = {
  [InfraMarketState.Callable]: "Propose an outcome as a winner",
  [InfraMarketState.Closable]: "Close and collect rewards",
  [InfraMarketState.Whinging]: "Dispute this proposal",
  [InfraMarketState.Predicting]: "Lock ARB to Secure Your Proposal",
  [InfraMarketState.Revealing]: "Claimable for yield",
  [InfraMarketState.Declarable]: "Claimable for yield",
  [InfraMarketState.Sweeping]: "Claimable for yield",
  [InfraMarketState.Closed]: "Claimable for yield",
  [InfraMarketState.Loading]: "Loading...",
} as const;
const infraMarketStateColors: Record<InfraMarketState, string> = {
  [InfraMarketState.Callable]: "bg-9yellow",
  [InfraMarketState.Closable]: "bg-9green",
  [InfraMarketState.Whinging]: "bg-9purple",
  [InfraMarketState.Predicting]: "bg-9blueLight",
  [InfraMarketState.Revealing]: "bg-9green",
  [InfraMarketState.Declarable]: "bg-9green",
  [InfraMarketState.Sweeping]: "bg-9green",
  [InfraMarketState.Closed]: "bg-9green",
  [InfraMarketState.Loading]: "bg-9gray",
} as const;
const infraMarketStateFees: Record<InfraMarketState, bigint> = {
  [InfraMarketState.Callable]: BigInt(2e6),
  [InfraMarketState.Closable]: BigInt(0),
  [InfraMarketState.Whinging]: BigInt(7e6),
  [InfraMarketState.Predicting]: BigInt(0),
  [InfraMarketState.Revealing]: BigInt(0),
  [InfraMarketState.Declarable]: BigInt(0),
  [InfraMarketState.Sweeping]: BigInt(0),
  [InfraMarketState.Closed]: BigInt(0),
  [InfraMarketState.Loading]: BigInt(0),
} as const;
export const categories = [
  "All",
  "Crypto",
  "Opinion Poll",
  "Price Prediction",
  "Sports",
  "Politics",
  "Pop Culture",
  "Business",
  "Jailtime.fun",
];
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
  infraMarket: z.object({
    titles: z.record(z.string(), z.string()),
    colors: z.record(z.string(), z.string()),
    fees: z.record(z.string(), z.bigint()),
  }),
  categories: z.array(
    z.enum([
      "All",
      "Crypto",
      "Opinion Poll",
      "Price Prediction",
      "Sports",
      "Politics",
      "Pop Culture",
      "Business",
      "Jailtime.fun",
    ]),
  ),
  frame: z.any(),
});
const requiredChains = Object.values(farcasterChains).map(
  (chain) => `eip155:${chain.id}`,
);
const frame = {
  version: "next",
  name: metadata.title,
  iconUrl: `${metadata.metadataBase.origin}/images/icon-farcaster.png`,
  homeUrl: metadata.metadataBase.origin,
  imageUrl: `${metadata.metadataBase.origin}/images/frame.png`,
  buttonTitle: "Launch Frame",
  splashImageUrl: `${metadata.metadataBase.origin}/images/splash-farcaster.png`,
  splashBackgroundColor: "#DDEAEF",
  requiredChains,
  description: metadata.description,
  primaryCategory: "finance",
  tags: metadata.keywords,
};
const appVars = appSchema.safeParse({
  metadata,
  infraMarket: {
    titles: infraMarketStateTitles,
    colors: infraMarketStateColors,
    fees: infraMarketStateFees,
  },
  categories,
  frame,
});

if (!appVars.success) {
  console.error("Invalid app config variables: ", appVars.error.name);
  throw new Error(appVars.error.message);
}

export default appVars.data;
