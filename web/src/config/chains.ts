import clientEnv from "./clientEnv";
import ETH from "#/images/chains/ethereum.svg";
import ARB from "#/images/chains/arbitrum.svg";
import OP from "#/images/chains/optimism.svg";
import BSC from "#/images/chains/bsc.svg";
import POL from "#/images/chains/polygon.svg";
import BASE from "#/images/chains/base.svg";
import AVAX from "#/images/chains/avalanche.svg";
import MEGAETH from "#/images/chains/megaeth.svg";
import HYPEREVM from "#/images/chains/hyperevm.svg";
import TEMPO from "#/images/chains/tempo.png";
import { defineChain } from "@reown/appkit/networks";
import {
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon,
  bsc,
  avalanche,
  megaeth,
  hyperEvm,
  tempo,
} from "@reown/appkit/networks";

const farcasterList = {
  base: { ...base, icon: BASE },
  arbitrum: { ...arbitrum, icon: ARB },
  ethereum: { ...mainnet, icon: ETH },
  optimism: { ...optimism, icon: OP },
  polygon: { ...polygon, icon: POL },
  bsc: { ...bsc, icon: BSC },
  avalanche: { ...avalanche, icon: AVAX },
  megaeth: { ...megaeth, icon: MEGAETH },
  hyperEvm: { ...hyperEvm, icon: HYPEREVM },
  tempo: { ...tempo, icon: TEMPO },
} as const;
const chainList = {
  arbitrum: { ...arbitrum, icon: ARB },
  ethereum: { ...mainnet, icon: ETH },
  optimism: { ...optimism, icon: OP },
  base: { ...base, icon: BASE },
  polygon: { ...polygon, icon: POL },
  bsc: { ...bsc, icon: BSC },
  avalanche: { ...avalanche, icon: AVAX },
  megaeth: { ...megaeth, icon: MEGAETH },
  hyperEvm: { ...hyperEvm, icon: HYPEREVM },
  tempo: { ...tempo, icon: TEMPO },
};
export const chainIdToEid: Record<number, number> = {
  [arbitrum.id]: 30110,
  [mainnet.id]: 30101,
  [optimism.id]: 30111,
  [base.id]: 30184,
  [polygon.id]: 30109,
  [bsc.id]: 30102,
  [avalanche.id]: 30106,
  [hyperEvm.id]: 30367,
};

export default chainList;
export { farcasterList as farcasterChains };
export const destinationChain = { ...arbitrum, icon: ARB };
