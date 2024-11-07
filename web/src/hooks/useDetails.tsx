import tradingAbi from "@/config/abi/trading";
import { useQuery } from "@tanstack/react-query";
import {
  getContract,
  prepareContractCall,
  simulateTransaction,
} from "thirdweb";
import config from "@/config";
import { arbitrum } from "thirdweb/chains";
import { Detail } from "@/types";
interface useDetailsProps {
  tradingAddr: `0x${string}`;
  outcomeIds: `0x${string}`[];
}
export default function useDetails({
  tradingAddr,
  outcomeIds,
}: useDetailsProps) {
  return useQuery<Detail>({
    queryKey: ["details", tradingAddr, outcomeIds],
    queryFn: async () => {
      const shareIdx = 0;
      const investedIdx = 1;
      const isWinnerIdx = 3;
      const tradingContract = getContract({
        abi: tradingAbi,
        address: tradingAddr,
        client: config.thirdweb.client,
        chain: arbitrum,
      });
      const promises = outcomeIds.map((id) =>
        simulateTransaction({
          transaction: prepareContractCall({
            contract: tradingContract,
            method: "details",
            params: [id],
          }),
        }),
      );
      const results = await Promise.all(promises);
      const details = results.reduce(
        (acc: Detail, cur: any[], curIdx) => {
          acc.totalInvestment += cur[investedIdx];
          acc.totalShares += cur[shareIdx];
          acc.winner = cur[isWinnerIdx] ? outcomeIds[curIdx] : acc.winner;
          acc.outcomes = [
            ...acc.outcomes,
            {
              id: outcomeIds[curIdx],
              share: cur[shareIdx],
              invested: cur[investedIdx],
              isWinner: cur[isWinnerIdx],
            },
          ];
          return acc;
        },
        {
          totalInvestment: BigInt(0),
          totalShares: BigInt(0),
          winner: undefined,
          outcomes: [],
        },
      );
      return details;
    },
  });
}
