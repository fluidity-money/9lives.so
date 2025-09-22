import { requestPnLOfWonCampaigns } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function usePnLOfWonCampaigns(address?: string) {
  return useQuery({
    queryKey: ["PnLOfWonCampaigns", address],
    queryFn: async () => {
      if (!address) return [];
      return await requestPnLOfWonCampaigns(address);
    },
  });
}
