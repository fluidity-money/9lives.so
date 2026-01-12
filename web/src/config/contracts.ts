import z from "zod";
import ERC20Abi from "./abi/erc20";
import ammAbi from "./abi/amm";
import helperFactoryAbi from "./abi/helperFactory";
import buyHelperAbi from "./abi/buyHelper";
import clientEnv from "./clientEnv";
import lensAbi from "./abi/lens";
import infraAbi from "./abi/infra";
import meowDomainsAbi from "./abi/meowDomains";
import sarpSignallerAbi from "./abi/sarpSignaller";
import claimantAbi from "./abi/claimantHelper";
import buyHelper2Abi from "./abi/buyHelper2";
import paymasterAbi from "./abi/paymaster";
const contractSchema = z.object({
  abi: z.array(z.any()).optional(),
  address: z.string(),
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
  paymaster: contractSchema,
});

const fusdc = {
  abi: ERC20Abi,
  address: clientEnv.NEXT_PUBLIC_FUSDC_ADDR as `0x${string}`,
};
const amm = {
  abi: ammAbi,
  address: clientEnv.NEXT_PUBLIC_AMM_ADDR as `0x${string}`,
};
const lens = {
  abi: lensAbi,
  address: clientEnv.NEXT_PUBLIC_LENS_ADDR as `0x${string}`,
};
const helperFactory = {
  abi: helperFactoryAbi,
  address: clientEnv.NEXT_PUBLIC_HELPER_FACTORY_ADDR as `0x${string}`,
};
const infra = {
  abi: infraAbi,
  address: clientEnv.NEXT_PUBLIC_INFRA_ADDR as `0x${string}`,
};
const buyHelper = {
  abi: buyHelperAbi,
  address: clientEnv.NEXT_PUBLIC_BUY_HELPER_ADDR as `0x${string}`,
};
const buyHelper2 = {
  abi: buyHelper2Abi,
  address: clientEnv.NEXT_PUBLIC_BUY_HELPER2_ADDR as `0x${string}`,
};
const meowDomains = {
  abi: meowDomainsAbi,
  address: clientEnv.NEXT_PUBLIC_MEOW_DOMAINS_ADDR as `0x${string}`,
};
const sarpSignaller = {
  abi: sarpSignallerAbi,
  address: clientEnv.NEXT_PUBLIC_SARP_SIGNALLER_ADDR as `0x${string}`,
};
const claimantHelper = {
  abi: claimantAbi,
  address: clientEnv.NEXT_PUBLIC_CLAIMANT_HELPER_ADDR as `0x${string}`,
};
const paymaster = {
  abi: paymasterAbi,
  address: clientEnv.NEXT_PUBLIC_PAYMASTER_ADDR as `0x${string}`,
};
const contractsData = {
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
  paymaster,
} as const;

const contractValidation = allContractSchema.safeParse(contractsData);

if (!contractValidation.success) {
  console.error("Invalid contract: ", contractValidation.error.name);
  throw new Error(contractValidation.error.message);
}

export default contractsData;
