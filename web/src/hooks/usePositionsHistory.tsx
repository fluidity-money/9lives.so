import { requestPositionHistory } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function usePositionHistory(
  address?: string,
  outcomeIds?: string[],
) {
  return useQuery({
    queryKey: ["positionHistory", address, outcomeIds],
    queryFn: async () => {
      if (!outcomeIds || !address) return [];
      const res = await requestPositionHistory(address, outcomeIds);
      return res.map((i) => ({
        fromAmount: i.fromAmount,
        toAmount: i.toAmount,
        id: `0x${i.outcomeId}`,
        type: i.type,
        txHash: i.txHash,
      }));
    },
  });
}
