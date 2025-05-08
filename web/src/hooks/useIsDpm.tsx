import tradingAbi from "@/config/abi/trading";
import { currentChain } from "@/config/chains";
import thirdweb from "@/config/thirdweb";
import { useQuery } from "@tanstack/react-query";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
export default function useIsDpm(
  tradingAddr: `0x${string}`,
  initialData?: any,
) {
  return useQuery({
    queryKey: ["isDpm", tradingAddr],
    queryFn: async () => {
      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        chain: currentChain,
        client: thirdweb.client,
      });
      const isDpmTx = prepareContractCall({
        contract: tradingContract,
        method: "isDpm",
      });
      return await simulateTransaction({
        transaction: isDpmTx,
      });
    },
    initialData,
  });
}
