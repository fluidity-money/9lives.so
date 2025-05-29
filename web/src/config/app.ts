import z from "zod";
import ETH from "#/images/chains/ethereum.svg";
import SPN from "#/images/chains/superposition.svg";
import ARB from "#/images/chains/arbitrum.svg";
import OP from "#/images/chains/optimism.svg";
import BSC from "#/images/chains/bsc.svg";
import POL from "#/images/chains/polygon.svg";
import BASE from "#/images/chains/base.svg";
import AVAX from "#/images/chains/avalanche.svg";
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
  supportedCrossChains: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      img: z.any(),
    }),
  ),
});

const supportedCrossChains = [
  {
    id: 55244,
    name: "Superposition",
    img: SPN,
  },
  {
    id: 42161,
    name: "Arbitrum One",
    img: ARB,
  },
  {
    id: 1,
    name: "Ethereum Mainnet",
    img: ETH,
  },
  {
    id: 56,
    name: "Binance Smart Chain",
    img: BSC,
  },
  {
    id: 43114,
    name: "Avalanche C-Chain",
    img: AVAX,
  },
  {
    id: 10,
    name: "Optimism",
    img: OP,
  },
  {
    id: 8453,
    name: "Base",
    img: BASE,
  },
  {
    id: 137,
    name: "Polygon",
    img: POL,
  },
];

const appVars = appSchema.safeParse({
  metadata,
  infraMarket: {
    titles: infraMarketStateTitles,
    colors: infraMarketStateColors,
    fees: infraMarketStateFees,
  },
  categories,
  supportedCrossChains,
});

if (!appVars.success) {
  console.error("Invalid app config variables: ", appVars.error.name);
  throw new Error(appVars.error.message);
}

export default appVars.data;
