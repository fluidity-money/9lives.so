import { requestPositionHistory } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function usePositionHistory(outcomeIds?: string[]) {
  return useQuery({
    queryKey: ["positionHistory", outcomeIds],
    queryFn: async () => {
      if (!outcomeIds) return [];
      const res = await requestPositionHistory(outcomeIds);
      return res.map((i) => ({
        usdc: i.fromAmount,
        share: i.toAmount,
        id: `0x${i.outcomeId}`,
        txHash: i.txHash,
      }));
    },
  });
}
