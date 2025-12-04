import z from "zod";
import { farcasterChains } from "./chains";
import BTC from "#/images/tokens/btc.webp";
import PAXG from "#/images/tokens/paxg.svg";
import NVIDIA from "#/images/tokens/nvidia.svg";
import MONAD from "#/images/tokens/mon.svg";
import GOOGLE from "#/images/tokens/google.svg";
import QQQ from "#/images/tokens/qqq.svg";
import { StaticImageData } from "next/image";
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
  title: "9lives.so",
  description: "The most advanced prediction market",
  metadataBase: new URL("https://9lives.so"),
  keywords: [
    "prediction market",
    "predict",
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
const categories = [
  "All",
  "Hourly",
  "Daily",
  "Crypto",
  "Opinion Poll",
  "Sports",
  "Politics",
];
const stockMarketCloseDaysUS = [
  "25-12-2025",
  "01-01-2026",
  "19-01-2026",
  "16-02-2026",
  "03-04-2026",
  "25-05-2026",
  "19-06-2026",
  "03-07-2026",
  "07-09-2026",
  "26-11-2026",
  "25-12-2026",
];
const stockMarketOpenHoursUS = ["09:30", "16:00"];
const stockMarketOpenDaysUS = [1, 2, 3, 4, 5];
const simpleMarkets = {
  btc: {
    slug: "btc",
    logo: BTC,
    title: "BTC",
    tabTitle: "BTC",
    decimals: 2,
    periods: ["hourly", "daily"],
    openDays: [0, 1, 2, 3, 4, 5, 6],
    openHours: ["00:00", "23:59"],
    tz: "UTC",
  },
  paxg: {
    slug: "paxg",
    logo: PAXG,
    title: "Gold (PAXG)",
    tabTitle: "GOLD",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    decimals: 2,
    periods: ["hourly"],
    openHours: ["00:00", "23:59"],
    tz: "UTC",
  },
  mon: {
    slug: "mon",
    logo: MONAD,
    title: "MONAD",
    tabTitle: "MONAD",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    decimals: 6,
    periods: ["hourly"],
    openHours: ["00:00", "23:59"],
    tz: "UTC",
  },
  nvidia: {
    slug: "nvidia",
    logo: NVIDIA,
    title: "NVIDIA",
    tabTitle: "NVIDIA",
    decimals: 2,
    periods: ["hourly"],
    openDays: stockMarketOpenDaysUS,
    openHours: stockMarketOpenHoursUS,
    closeDays: stockMarketCloseDaysUS,
    tz: "America/New_York",
  },
  goog: {
    slug: "goog",
    logo: GOOGLE,
    title: "GOOGLE",
    tabTitle: "GOOGLE",
    decimals: 2,
    periods: ["hourly"],
    openDays: stockMarketOpenDaysUS,
    openHours: stockMarketOpenHoursUS,
    closeDays: stockMarketCloseDaysUS,
    tz: "America/New_York",
  },
  qqq: {
    slug: "qqq",
    logo: QQQ,
    title: "Nasdaq (QQQ)",
    tabTitle: "QQQ",
    decimals: 2,
    periods: ["daily"],
    openDays: stockMarketOpenDaysUS,
    openHours: stockMarketOpenHoursUS,
    closeDays: stockMarketCloseDaysUS,
    tz: "America/New_York",
  },
} as const;

const simpleMarketSchema = z.object({
  slug: z.string(),
  logo: z.custom<StaticImageData>(),
  title: z.string(),
  decimals: z.number(),
  tabTitle: z.string(),
  periods: z.array(z.union([z.literal("hourly"), z.literal("daily")])),
  openDays: z.array(z.number()),
  closeDays: z.optional(z.array(z.string())),
  openHours: z.array(z.string()),
  tz: z.string(),
});

const simpleMarketSchemas = (
  Object.keys(simpleMarkets) as (keyof typeof simpleMarkets)[]
).reduce(
  (acc, v) => {
    acc[v] = simpleMarketSchema;
    return acc;
  },
  {} as Record<keyof typeof simpleMarkets, typeof simpleMarketSchema>,
);

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
  simpleMarkets: z.object(simpleMarketSchemas),
  categories: z.array(
    z.enum([
      "All",
      "Hourly",
      "Daily",
      "Crypto",
      "Opinion Poll",
      "Sports",
      "Politics",
    ]),
  ),
  frame: z.any(),
  weekDuration: z.number(),
  hasuraMaxQueryItem: z.number(),
});
const requiredChains = Object.values(farcasterChains).map(
  (chain) => `eip155:${chain.id}`,
);
const farcasterTags = ["predict", "prediction", "prediction-market", "defi"];
const frame = {
  version: "1",
  name: metadata.title,
  iconUrl: `${metadata.metadataBase.origin}/images/icon-farcaster.png`,
  homeUrl: metadata.metadataBase.origin,
  imageUrl: `${metadata.metadataBase.origin}/images/frame.png`,
  splashImageUrl: `${metadata.metadataBase.origin}/images/splash-farcaster.png`,
  splashBackgroundColor: "#DDEAEF",
  requiredChains,
  description: metadata.description,
  primaryCategory: "finance",
  tags: farcasterTags,
  button: {
    title: "Predict",
    action: {
      type: "launch_frame",
      name: metadata.title,
      url: metadata.metadataBase.origin,
      splashImageUrl: `${metadata.metadataBase.origin}/images/splash-farcaster.png`,
      splashBackgroundColor: "#DDEAEF",
    },
  },
};
const appVars = appSchema.safeParse({
  metadata,
  infraMarket: {
    titles: infraMarketStateTitles,
    colors: infraMarketStateColors,
    fees: infraMarketStateFees,
  },
  simpleMarkets,
  categories,
  frame,
  weekDuration: 60 * 60 * 24 * 7 * 1000,
  hasuraMaxQueryItem: 3600,
});

if (!appVars.success) {
  console.error("Invalid app config variables: ", appVars.error.name);
  throw new Error(appVars.error.message);
}

export default appVars.data;
