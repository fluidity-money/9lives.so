import z from "zod";
import { getContract } from "thirdweb";
import { superpositionTestnet } from "@/config/chains";
import factoryAbi from "./abi/factory";
import ERC20Abi from "./abi/erc20";
import ammAbi from "./abi/amm";
import clientEnv from "./clientEnv";
import { thirdwebClient } from "./app";

const contractSchema = z.object({
  abi: z.array(z.any()).optional(),
  address: z.string(),
  chain: z.object({
    rpc: z.string(),
  }),
  client: z.object({}),
});

const allContractSchema = z.object({
  decimals: z.object({
    fusdc: z.number().default(6),
  }),
  fusdc: contractSchema,
  factory: contractSchema,
  amm: contractSchema,
});

const fusdc = getContract({
  abi: ERC20Abi,
  address: clientEnv.NEXT_PUBLIC_FUSDC_ADDR,
  chain: superpositionTestnet,
  client: thirdwebClient,
});
const factory = getContract({
  abi: factoryAbi,
  address: clientEnv.NEXT_PUBLIC_FACTORY_ADDR,
  chain: superpositionTestnet,
  client: thirdwebClient,
});
const amm = getContract({
  abi: ammAbi,
  address: clientEnv.NEXT_PUBLIC_AMM_ADDR,
  chain: superpositionTestnet,
  client: thirdwebClient,
});

const contractValidation = allContractSchema.safeParse({
  decimals: {
    fusdc: 6,
  },
  fusdc,
  factory,
  amm,
});

type ContractsType = z.infer<typeof allContractSchema>;

if (!contractValidation.success) {
  console.error("Invalid contract: ", contractValidation.error.name);
  throw new Error(contractValidation.error.message);
}

export default contractValidation.data as {
  decimals: ContractsType["decimals"];
  fusdc: typeof fusdc;
  factory: typeof factory;
  amm: typeof amm;
};
