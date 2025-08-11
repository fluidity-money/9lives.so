import tradingAbi from "@/config/abi/trading";
import { destinationChain } from "@/config/chains";
import thirdweb from "@/config/thirdweb";
import { useQuery } from "@tanstack/react-query";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { Account } from "thirdweb/wallets";

export default function useEstimateBurn({
  outcomeId,
  tradingAddr,
  share,
  account,
}: {
  outcomeId: `0x${string}`;
  tradingAddr: `0x${string}`;
  share?: bigint;
  account?: Account;
}) {
  return useQuery({
    queryKey: ["estimateBurn", outcomeId, tradingAddr, Number(share), account],
    queryFn: async () => {
      if (!account) return BigInt(0);
      if (!share || share <= BigInt(0)) return BigInt(0);
      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        chain: destinationChain,
        client: thirdweb.client,
      });
      const estimateTx = prepareContractCall({
        contract: tradingContract,
        method: "estimateBurnE9B09A17",
        params: [outcomeId, share],
      });
      const usdc = (await simulateTransaction({
        transaction: estimateTx,
        account,
      })) as bigint;
      return usdc;
    },
  });
}
