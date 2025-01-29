import { InfraMarketState } from "@/types";
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
const infraMarketStateTitles: Record<InfraMarketState, string> = {
  [InfraMarketState.Callable]: "Callable",
  [InfraMarketState.Closable]: "Callable",
  [InfraMarketState.Whinging]: "In Dispute",
  [InfraMarketState.Predicting]: "Prediction stage",
  [InfraMarketState.Revealing]: "Claimable for yield",
  [InfraMarketState.Declarable]: "Claimable for yield",
  [InfraMarketState.Sweeping]: "Claimable for yield",
  [InfraMarketState.Closed]: "Claimable for yield",
  [InfraMarketState.Loading]: "Loading...",
} as const;
const infraMarketStateColors: Record<InfraMarketState, string> = {
  [InfraMarketState.Callable]: "bg-9green",
  [InfraMarketState.Closable]: "bg-9green",
  [InfraMarketState.Whinging]: "bg-9purple",
  [InfraMarketState.Predicting]: "bg-9lightBlue",
  [InfraMarketState.Revealing]: "bg-9yellow",
  [InfraMarketState.Declarable]: "bg-9yellow",
  [InfraMarketState.Sweeping]: "bg-9yellow",
  [InfraMarketState.Closed]: "bg-9yellow",
  [InfraMarketState.Loading]: "bg-9gray",
} as const;
const infraMarketStateMethods: Record<InfraMarketState, string> = {
  [InfraMarketState.Callable]: "bg-9green",
  [InfraMarketState.Closable]: "bg-9green",
  [InfraMarketState.Whinging]: "bg-9purple",
  [InfraMarketState.Predicting]: "bg-9lightBlue",
  [InfraMarketState.Revealing]: "bg-9yellow",
  [InfraMarketState.Declarable]: "bg-9yellow",
  [InfraMarketState.Sweeping]: "bg-9yellow",
  [InfraMarketState.Closed]: "bg-9yellow",
  [InfraMarketState.Loading]: "bg-9gray",
} as const;

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
  }),
});

const appVars = appSchema.safeParse({
  metadata,
  infraMarket: {
    titles: infraMarketStateTitles,
    colors: infraMarketStateColors,
  },
});

if (!appVars.success) {
  console.error("Invalid app config variables: ", appVars.error.name);
  throw new Error(appVars.error.message);
}

export default appVars.data;
