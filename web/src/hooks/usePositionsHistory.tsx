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
      const buys = Array.from(
        res
          .filter((i) => i.type === "buy")
          .map((i) => ({ ...i, price: i.fromAmount / i.toAmount })),
      );
      const sells = Array.from(res.filter((i) => i.type === "sell"));
      for (let i = 0; i < sells.length; i++) {
        const sell = sells[i];
        while (sell.fromAmount > 0) {
          const buy = buys.find((b) => b.outcomeId === sell.outcomeId);
          if (buy) {
            const buyIndex = buys.indexOf(buy);
            if (sell.fromAmount >= buy.toAmount) {
              buys.splice(buyIndex, 1);
              sell.fromAmount -= buy.toAmount;
            } else {
              buys[buyIndex].toAmount -= sell.fromAmount;
              buys[buyIndex].fromAmount = Math.round(
                buys[buyIndex].toAmount * buys[buyIndex].price,
              );
              sell.fromAmount = 0;
            }
          }
        }
      }
      const results = buys.map((i) => ({
        fromAmount: i.fromAmount,
        toAmount: i.toAmount,
        outcomeId: `0x${i.outcomeId}`,
        type: i.type,
        txHash: i.txHash,
      }));
      return results;
    },
    staleTime: 4000,
  });
}
