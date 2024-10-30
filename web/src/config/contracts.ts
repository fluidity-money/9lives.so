import z from "zod";
import { getContract } from "thirdweb";
import { arbitrum } from "thirdweb/chains";
import thirdweb from "@/config/thirdweb";
import factoryAbi from "./abi/factory";
import ERC20Abi from "./abi/erc20";
import ammAbi from "./abi/amm";
import clientEnv from "./clientEnv";
import lensAbi from "./abi/lens";

const contractSchema = z.object({
  abi: z.array(z.any()).optional(),
  address: z.string(),
  chain: z.object({
    rpc: z.string(),
  }),
  client: z.object({
    clientId: z.string()
  }),
});

const allContractSchema = z.object({
  decimals: z.object({
    fusdc: z.number().default(6),
  }),
  fusdc: contractSchema,
  factory: contractSchema,
  amm: contractSchema,
  lens: contractSchema,
});

const fusdc = getContract({
  abi: ERC20Abi,
  address: clientEnv.NEXT_PUBLIC_FUSDC_ADDR,
  chain: arbitrum,
  client: thirdweb.client,
});
const factory = getContract({
  abi: factoryAbi,
  address: clientEnv.NEXT_PUBLIC_FACTORY_ADDR,
  chain: arbitrum,
  client: thirdweb.client,
});
const amm = getContract({
  abi: ammAbi,
  address: clientEnv.NEXT_PUBLIC_AMM_ADDR,
  chain: arbitrum,
  client: thirdweb.client,
});
const lens = getContract({
  abi: lensAbi,
  address: clientEnv.NEXT_PUBLIC_LENS_ADDR,
  chain: arbitrum,
  client: thirdweb.client,
});

const contractValidation = allContractSchema.safeParse({
  decimals: {
    fusdc: 6,
  },
  fusdc,
  factory,
  amm,
  lens,
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
  lens: typeof lens;
};
