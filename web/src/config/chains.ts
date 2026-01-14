import clientEnv from "./clientEnv";
import ETH from "#/images/chains/ethereum.svg";
import SPN from "#/images/chains/superposition.svg";
import ARB from "#/images/chains/arbitrum.svg";
import OP from "#/images/chains/optimism.svg";
import BSC from "#/images/chains/bsc.svg";
import POL from "#/images/chains/polygon.svg";
import BASE from "#/images/chains/base.svg";
import AVAX from "#/images/chains/avalanche.svg";
import { defineChain } from "@reown/appkit/networks";
import {
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon,
  bsc,
  avalanche,
} from "@reown/appkit/networks";

const superpositionTestnet = defineChain({
  name: "Superposition Testnet",
  id: 98985,
  nativeCurrency: { name: "Superposition", symbol: "SPN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.superposition.so"] },
  },
  chainNamespace: "eip155",
  caipNetworkId: `eip155:${98985}`,
  blockExplorers: {
    default: {
      name: "CatScan",
      url: "https://testnet-explorer.superposition.so",
    },
  },
  testnet: true,
});
const superposition = defineChain({
  name: "Superposition",
  id: 55244,
  chainNamespace: "eip155",
  caipNetworkId: `eip155:${55244}`,
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.superposition.so"] },
  },
  blockExplorers: {
    default: {
      name: "CatScan",
      url: "https://explorer.superposition.so",
    },
  },
});

const farcasterList = {
  base: { ...base, icon: BASE },
  superposition: { ...superposition, icon: SPN },
  arbitrum: { ...arbitrum, icon: ARB },
  ethereum: { ...mainnet, icon: ETH },
  optimism: { ...optimism, icon: OP },
  polygon: { ...polygon, icon: POL },
  bsc: { ...bsc, icon: BSC },
  avalanche: { ...avalanche, icon: AVAX },
} as const;
const chainList = {
  arbitrum: { ...arbitrum, icon: ARB },
  superposition: { ...superposition, icon: SPN },
  ethereum: { ...mainnet, icon: ETH },
  optimism: { ...optimism, icon: OP },
  base: { ...base, icon: BASE },
  polygon: { ...polygon, icon: POL },
  bsc: { ...bsc, icon: BSC },
  avalanche: { ...avalanche, icon: AVAX },
};
export const chainIdToEid: Record<number, number> = {
  [superposition.id]: 30327,
  [arbitrum.id]: 30110,
  [mainnet.id]: 30101,
  [optimism.id]: 30111,
  [base.id]: 30184,
  [polygon.id]: 30109,
  [bsc.id]: 30102,
  [avalanche.id]: 30106,
};

export default chainList;
export { farcasterList as farcasterChains };
export const destinationChain = {
  ...(clientEnv.NEXT_PUBLIC_CHAIN === "mainnet"
    ? superposition
    : superpositionTestnet),
  icon: SPN,
};
