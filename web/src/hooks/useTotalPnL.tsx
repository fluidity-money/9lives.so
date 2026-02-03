import { requestTotalPnL } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useTotalPnL(address?: string) {
  return useQuery({
    queryKey: ["realizedPnL", address],
    queryFn: async () => {
      if (!address) return { totalPnl: "0", volume: "0" };
      return await requestTotalPnL(address);
    },
    initialData: { totalPnl: "0", volume: "0" },
  });
}
