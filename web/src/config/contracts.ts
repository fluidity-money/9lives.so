import z from "zod";
import { getContract } from "thirdweb";
import thirdweb from "@/config/thirdweb";
import ERC20Abi from "./abi/erc20";
import ammAbi from "./abi/amm";
import helperFactoryAbi from "./abi/helperFactory";
import buyHelperAbi from "./abi/buyHelper";
import clientEnv from "./clientEnv";
import lensAbi from "./abi/lens";
import { currentChain } from "./chains";
import infraAbi from "./abi/infra";
const contractSchema = z.object({
  abi: z.array(z.any()).optional(),
  address: z.string(),
  chain: z.object({
    rpc: z.string(),
  }),
  client: z.object({
    clientId: z.string(),
  }),
});

const allContractSchema = z.object({
  decimals: z.object({
    fusdc: z.number().default(6),
    shares: z.number().default(6),
  }),
  fusdc: contractSchema,
  amm: contractSchema,
  lens: contractSchema,
  helperFactory: contractSchema,
  infra: contractSchema,
  buyHelper: contractSchema,
});

const fusdc = getContract({
  abi: ERC20Abi,
  address: clientEnv.NEXT_PUBLIC_FUSDC_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const amm = getContract({
  abi: ammAbi,
  address: clientEnv.NEXT_PUBLIC_AMM_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const lens = getContract({
  abi: lensAbi,
  address: clientEnv.NEXT_PUBLIC_LENS_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const helperFactory = getContract({
  abi: helperFactoryAbi,
  address: clientEnv.NEXT_PUBLIC_HELPER_FACTORY_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const infra = getContract({
  abi: infraAbi,
  address: clientEnv.NEXT_PUBLIC_INFRA_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const buyHelper = getContract({
  abi: buyHelperAbi,
  address: clientEnv.NEXT_PUBLIC_BUY_HELPER_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const contractValidation = allContractSchema.safeParse({
  decimals: {
    fusdc: 6,
    shares: 6,
  },
  fusdc,
  amm,
  lens,
  helperFactory,
  infra,
  buyHelper,
});

type ContractsType = z.infer<typeof allContractSchema>;

if (!contractValidation.success) {
  console.error("Invalid contract: ", contractValidation.error.name);
  throw new Error(contractValidation.error.message);
}

export default contractValidation.data as {
  decimals: ContractsType["decimals"];
  fusdc: typeof fusdc;
  amm: typeof amm;
  lens: typeof lens;
  helperFactory: typeof helperFactory;
  infra: typeof infra;
  buyHelper: typeof buyHelper;
};
