import { defineChain } from "thirdweb/chains";
import z from "zod";
import {
  ethereum,
  arbitrum,
  optimism,
  bsc,
  polygon,
  base,
  avalanche,
} from "thirdweb/chains";
import clientEnv from "./clientEnv";
import ETH from "#/images/chains/ethereum.svg";
import SPN from "#/images/chains/superposition.svg";
import ARB from "#/images/chains/arbitrum.svg";
import OP from "#/images/chains/optimism.svg";
import BSC from "#/images/chains/bsc.svg";
import POL from "#/images/chains/polygon.svg";
import BASE from "#/images/chains/base.svg";
import AVAX from "#/images/chains/avalanche.svg";
import APE from "#/images/chains/apechain.svg";

export const networkSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  nativeCurrency: z
    .object({
      name: z.string().optional(),
      symbol: z.string().optional(),
      decimals: z.number().optional(),
    })
    .optional(),
  rpc: z.string().url(),
  blockExplorers: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    }),
  ),
  testnet: z.boolean().optional(),
  icon: z.any().optional(),
});

const superpositionTestnet = defineChain({
  name: "Superposition Testnet",
  id: 98985,
  nativeCurrency: { name: "Superposition", symbol: "SPN", decimals: 18 },
  rpc: "https://testnet-rpc.superposition.so",
  blockExplorers: [
    {
      name: "CatScan",
      url: "https://testnet-explorer.superposition.so",
    },
  ],
  testnet: true,
  icon: SPN,
});
const superposition = defineChain({
  name: "Superposition",
  id: 55244,
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpc: "https://rpc.superposition.so",
  blockExplorers: [
    {
      name: "CatScan",
      url: "https://explorer.superposition.so",
    },
  ],
  icon: SPN,
});
const apechain = defineChain({
  name: "ApeChain",
  id: 33139,
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
  rpc: "https://apechain.calderachain.xyz/http",
  blockExplorers: [
    {
      name: "ApeScan",
      url: "https://apechain.calderaexplorer.xyz",
    },
  ],
  icon: APE,
});
const farcasterList = {
  superposition: { ...superposition, icon: SPN },
  arbitrum: { ...arbitrum, icon: ARB },
  // apechain: { ...apechain, icon: APE },
} as const;
const chainList = {
  superposition: { ...superposition, icon: SPN },
  arbitrum: { ...arbitrum, icon: ARB },
  ethereum: { ...ethereum, icon: ETH },
  optimism: { ...optimism, icon: OP },
  base: { ...base, icon: BASE },
  polygon: { ...polygon, icon: POL },
  bsc: { ...bsc, icon: BSC },
  avalanche: { ...avalanche, icon: AVAX },
} as const;
export const chainIdToEid: Record<number, number> = {
  [superposition.id]: 30327,
  [arbitrum.id]: 30110,
  [ethereum.id]: 30101,
  [optimism.id]: 30111,
  [base.id]: 30184,
  [polygon.id]: 30109,
  [bsc.id]: 30102,
  [avalanche.id]: 30106,
};
const supportedCrossChainSchema = z.record(z.string(), networkSchema);

// validate all chains
const chains = supportedCrossChainSchema.safeParse(chainList);

if (!chains.success) {
  console.error("Invalid chain: ", chains.error.name);
  throw new Error(chains.error.message);
}
export default chains.data as typeof chainList;
export { farcasterList as farcasterChains };
export const destinationChain =
  clientEnv.NEXT_PUBLIC_CHAIN === "mainnet"
    ? superposition
    : superpositionTestnet;
