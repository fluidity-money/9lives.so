import { requestTotalVolume } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useTotalVolume(address?: string) {
  return useQuery({
    queryKey: ["totalVolume", address],
    queryFn: async () => {
      if (!address) return 0;
      return await requestTotalVolume(address);
    },
  });
}
