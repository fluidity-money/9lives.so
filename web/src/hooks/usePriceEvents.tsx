import { requestPriceChanges } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function usePriceEvents(poolAddress: string) {
  return useQuery({
    queryKey: ["priceEvents", poolAddress],
    queryFn: async () => {
      return await requestPriceChanges(poolAddress);
    },
  });
}
