import { defineChain } from "thirdweb/chains";
import z from "zod";
import "thirdweb/utils";
// import { arbitrum } from "thirdweb/chains";

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
export const superpositionMainnet = defineChain({
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
});

// validate all chains
const chainValidation = z
  .array(networkSchema)
  .safeParse([superpositionTestnet, superpositionMainnet]);

if (!chainValidation.success) {
  console.error("Invalid chain: ", chainValidation.error.name);
  throw new Error(chainValidation.error.message);
}

// export const currentChain = arbitrum
// export const currentChain = superpositionTestnet;
export const currentChain = superpositionMainnet;
