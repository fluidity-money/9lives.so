import config from "@/config";
import tradingAbi from "@/config/abi/trading";
import { Outcome } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import { arbitrum } from "thirdweb/chains";

export default function useChances({
  tradingAddr,
  outcomes,
}: {
  tradingAddr: string;
  outcomes: Outcome[];
}) {
  return useQuery({
    queryKey: ["chances", tradingAddr, outcomes[0].identifier],
    queryFn: async () => {
      const investedIdx = 1;
      const globalInvestedIdx = 2;

      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: arbitrum,
      });

      const outcomeRes = await simulateTransaction({
        transaction: prepareContractCall({
          contract: tradingContract,
          method: "details",
          params: [outcomes[0].identifier],
        }),
      });
      const invested = Number(outcomeRes[investedIdx]);
      const globalInvested = Number(outcomeRes[globalInvestedIdx]);
      const res = outcomes.map((outcome) => ({
        id: outcome.identifier,
        chance:
          outcome.identifier === outcomes[0].identifier
            ? (invested / globalInvested) * 100
            : ((globalInvested - invested) / globalInvested) * 100,
      }));
      return res;
    },
  });
}
