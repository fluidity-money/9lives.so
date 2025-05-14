import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { toUnits } from "thirdweb/utils";
import { useQuery } from "@tanstack/react-query";

export default function useReturnValue({
  shareAddr,
  outcomeId,
  tradingAddr,
  fusdc,
}: {
  shareAddr: string;
  tradingAddr: string;
  outcomeId: `0x${string}`;
  fusdc: number;
}) {
  return useQuery({
    queryKey: ["returnValue", shareAddr, tradingAddr, outcomeId, fusdc],
    queryFn: async () => {
      const amount = toUnits(fusdc.toString(), config.contracts.decimals.fusdc);
      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.chains.currentChain,
      });
      const returnTx = prepareContractCall({
        contract: tradingContract,
        method: "quoteC0E17FC7",
        params: [outcomeId, amount],
      });
      const returnValue = (await simulateTransaction({
        transaction: returnTx,
      })) as [bigint, bigint] | undefined;
      return returnValue?.[0];
    },
    placeholderData: (prev) => prev,
  });
}
