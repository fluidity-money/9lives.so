import z from "zod";
import { farcasterChains } from "./chains";
import BTC from "#/images/tokens/btc.webp";
import PAXG from "#/images/tokens/paxg.svg";
import NVIDIA from "#/images/tokens/nvidia.svg";
import GOOGLE from "#/images/tokens/google.svg";
import QQQ from "#/images/tokens/qqq.svg";
import MONAD from "#/images/tokens/mon.svg";
import KAG from "#/images/tokens/kag.png";
import ETH from "#/images/tokens/eth.svg";
import SOL from "#/images/tokens/sol.svg";
import CVX from "#/images/tokens/cvx.png";
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
  "5mins",
  "15mins",
  "Hourly",
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
    periods: ["5mins", "hourly", "15mins"],
    openDays: [0, 1, 2, 3, 4, 5, 6],
    openHours: ["00:00", "23:59"],
    tz: "UTC",
    listed: true,
  },
  paxg: {
    slug: "paxg",
    logo: PAXG,
    title: "Gold (PAXG)",
    tabTitle: "GOLD",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    decimals: 2,
    periods: ["hourly", "15mins"],
    openHours: ["00:00", "23:59"],
    tz: "UTC",
    listed: true,
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
    listed: true,
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
    listed: true,
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
    listed: false,
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
    listed: false,
  },
  kag: {
    slug: "kag",
    logo: KAG,
    title: "Silver (KAG)",
    tabTitle: "SILVER",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    decimals: 2,
    periods: ["5mins"],
    openHours: ["00:00", "23:59"],
    tz: "UTC",
    listed: false,
  },
  eth: {
    slug: "eth",
    logo: ETH,
    title: "ETH",
    tabTitle: "ETH",
    decimals: 2,
    periods: ["5mins"],
    openDays: [0, 1, 2, 3, 4, 5, 6],
    openHours: ["00:00", "23:59"],
    tz: "UTC",
    listed: false,
  },
  sol: {
    slug: "sol",
    logo: SOL,
    title: "SOL",
    tabTitle: "SOL",
    decimals: 2,
    periods: ["5mins"],
    openDays: [0, 1, 2, 3, 4, 5, 6],
    openHours: ["00:00", "23:59"],
    tz: "UTC",
    listed: false,
  },
  cvx: {
    slug: "cvx",
    logo: CVX,
    title: "CVX",
    tabTitle: "CVX",
    decimals: 2,
    periods: ["15mins"],
    openDays: stockMarketOpenDaysUS,
    openHours: stockMarketOpenHoursUS,
    closeDays: stockMarketCloseDaysUS,
    tz: "America/New_York",
    listed: true,
  },
} as const;
const betaTesterWallets = [
  "0x77d55ee17071f2081edadcd7173adc876f3a602b",
  "0x7c095716b3f601b340c7d583b7b1d15a214b55d3",
  "0x88769789657055e5629b758124f3bc52f218a2c5",
  "0x65c5059eb8df20095911de6cac883e95ff11a298",
  "0x98e9e20b151b6dce571cd15dd9a14b1d145b9a72",
  "0x28ecb498b2f34dd717aee529de358005e88669e5",
  "0x64285a547a12c462aaae2facb1198b03ff1107d3",
  "0x1bd48b7f376fec854ae2535fcbca034a2a5ced01",
  "0x3b76126924c21bafb85c8ccade86b2863b2ad025",
  "0xdc415ac0683544dd78865ab686ba53e778ec5630",
  "0x636ab835fd2df941b6ed0915783bbc2628cc9b69",
  "0xcc4ba677522ac1cfbdad2d19deda214f3ae165cf",
  "0x54384e813145f49eb687e2f3893a10bf3d28f4e6",
  "0x2c1259a2c764dcc66241edfbdfd281afcb6d870a",
  "0xb47f19c895831c219966bcbebc803996e1322a2f",
  "0x136d289c9c586d7c7fd3a39635a4877796845312",
  "0x95c5cdd56c86e00ec40f375407ff6a23443ba0f3",
  "0x8c587db57d05c086177233d3bcb25a7739419c71",
  "0x6221a9c005f6e47eb398fd867784cacfdcfff4e7",
  "0xaa94994aa85e4dd68a7c468e8a9f7951cd217cb3",
  "0xd31fe3b2c23bbf7301deb5888f0627482a7622b6",
  "0xb0de5be61acec6e932b4151ff7470e7db5ca281d",
  "0xd89330b021e8991820ce0b73499f2c609fa58840",
  "0xf52a30397151c77e732fa5defb9347359c52a141",
  "0x078c44d92ab34a0fe8896631c6ab558b666cc2a3",
  "0x0559ea2bc93be2664c574d78ec1f49433d0d25a3",
  "0xebc45d9ca05b8f298a0a8c1ed1ed0c7e8c4f5eaf",
];
const simpleMarketSchema = z.object({
  slug: z.string(),
  logo: z.custom<StaticImageData>(),
  title: z.string(),
  decimals: z.number(),
  tabTitle: z.string(),
  periods: z.array(
    z.union([
      z.literal("hourly"),
      z.literal("5mins"),
      z.literal("15mins"),
      z.literal("daily"),
    ]),
  ),
  openDays: z.array(z.number()),
  closeDays: z.optional(z.array(z.string())),
  openHours: z.array(z.string()),
  tz: z.string(),
  listed: z.boolean(),
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
      "5mins",
      "15mins",
      "Hourly",
      "Crypto",
      "Opinion Poll",
      "Sports",
      "Politics",
    ]),
  ),
  frame: z.any(),
  weekDuration: z.number(),
  hasuraMaxQueryItem: z.number(),
  betaTesterWallets: z.array(z.string()),
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
  betaTesterWallets,
});

if (!appVars.success) {
  console.error("Invalid app config variables: ", appVars.error.name);
  throw new Error(appVars.error.message);
}

export default appVars.data;
