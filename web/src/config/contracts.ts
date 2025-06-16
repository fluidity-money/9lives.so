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
import meowDomainsAbi from "./abi/meowDomains";
import sarpSignallerAbi from "./abi/sarpSignaller";
import claimantAbi from "./abi/claimantHelper";
import buyHelper2Abi from "./abi/buyHelper2";
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
  meowDomains: contractSchema,
  sarpSignaller: contractSchema,
  claimantHelper: contractSchema,
  buyHelper2: contractSchema,
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
const buyHelper2 = getContract({
  abi: buyHelper2Abi,
  address: clientEnv.NEXT_PUBLIC_BUY_HELPER2_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const meowDomains = getContract({
  abi: meowDomainsAbi,
  address: clientEnv.NEXT_PUBLIC_MEOW_DOMAINS_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const sarpSignaller = getContract({
  abi: sarpSignallerAbi,
  address: clientEnv.NEXT_PUBLIC_SARP_SIGNALLER_ADDR,
  chain: currentChain,
  client: thirdweb.client,
});
const claimantHelper = getContract({
  abi: claimantAbi,
  address: clientEnv.NEXT_PUBLIC_CLAIMANT_HELPER_ADDR,
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
  meowDomains,
  sarpSignaller,
  claimantHelper,
  buyHelper2,
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
  meowDomains: typeof meowDomains;
  sarpSignaller: typeof sarpSignaller;
  claimantHelper: typeof claimantHelper;
  buyHelper2: typeof buyHelper2;
};
