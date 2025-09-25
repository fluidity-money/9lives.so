import { requestPriceChanges } from "@/providers/graphqlClient";
import { PriceEvent } from "@/types";
import { useQuery } from "@tanstack/react-query";

export default function usePriceEvents(
  poolAddress: string,
  initialData: PriceEvent[],
) {
  return useQuery({
    queryKey: ["priceEvents", poolAddress],
    queryFn: async () => {
      return await requestPriceChanges(poolAddress);
    },
    initialData,
  });
}
