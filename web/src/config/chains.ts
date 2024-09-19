import { ChainOptions, defineChain } from "thirdweb/chains";
import z from "zod";
import "thirdweb/utils";

const networkSchema = z.object({
  id: z.number(),
  name: z.string(),
  nativeCurrency: z.object({
    name: z.string().optional(),
    symbol: z.string().optional(),
    decimals: z.number().optional(),
  }),
  rpc: z.string().url(),
  blockExplorers: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    }),
  ),
  testnet: z.boolean().optional(),
  icon: z.string().optional(),
});

export const superpositionTestnet = defineChain({
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
});

export const allTestnets = [superpositionTestnet] as const;

export const allMainnets = [] as const;

export const allChains = [...allTestnets, ...allMainnets] as Readonly<
  ChainOptions & { rpc: string }
>[];

export function useChain(chainId: (typeof allChains)[number]["id"]) {
  return allChains.find((chain) => chain.id === chainId)!;
}

// validate all chains
const chainValidation = z.array(networkSchema).safeParse(allChains);

if (!chainValidation.success) {
  console.error("Invalid chain: ", chainValidation.error.name);
  throw new Error(chainValidation.error.message);
}
