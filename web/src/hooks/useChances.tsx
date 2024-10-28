import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { Outcome } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";

export default function useChances({
  tradingAddr,
  outcomeId,
  outcomes,
}: {
  tradingAddr: string;
  outcomeId: `0x${string}`;
  outcomes: Outcome[];
}) {
  return useQuery({
    queryKey: ["chances", tradingAddr, outcomeId],
    queryFn: async () => {
      const investedIdx = 1;
      const globalInvestedIdx = 2;

      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: config.chains.superpositionTestnet,
      });

      const outcomeRes = await simulateTransaction({
        transaction: prepareContractCall({
          contract: tradingContract,
          method: "details",
          params: [outcomeId],
        }),
      });
      const invested = Number(outcomeRes[investedIdx]);
      const globalInvested = Number(outcomeRes[globalInvestedIdx]);
      const res = outcomes.map((outcome) => ({
        id: outcome.identifier,
        chance:
          outcome.identifier === outcomeId
            ? (invested / globalInvested) * 100
            : ((globalInvested - invested) / globalInvested) * 100,
      }));
      return res;
    },
  });
}
