import config from "@/config";
import ERC20Abi from "@/config/abi/erc20";
import { useQuery } from "@tanstack/react-query";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";

export default function useBalance(
  account?: Account,
  erc20Addr: string = config.contracts.fusdc.address,
) {
  let contract: typeof config.contracts.fusdc;
  if (erc20Addr) {
    contract = getContract({
      abi: ERC20Abi,
      address: erc20Addr,
      chain: config.thirdweb.chain,
      client: config.thirdweb.client,
    });
  } else {
    contract = config.contracts.fusdc;
  }
  return useQuery<string>({
    queryKey: ["balance", account?.address, contract],
    queryFn: async () => {
      if (!account?.address) return "0";
      const balanceOfTx = prepareContractCall({
        contract,
        method: "balanceOf",
        params: [account?.address],
      });
      return await simulateTransaction({
        transaction: balanceOfTx,
      });
    },
    initialData: "0",
  });
}
