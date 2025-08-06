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
  return useQuery<string>({
    queryKey: ["balance", account?.address, erc20Addr],
    queryFn: async () => {
      if (!account?.address) return "0";
      let contract: typeof config.contracts.fusdc;
      if (erc20Addr) {
        contract = getContract({
          abi: ERC20Abi,
          address: erc20Addr,
          chain: config.destinationChain,
          client: config.thirdweb.client,
        });
      } else {
        contract = config.contracts.fusdc;
      }
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
