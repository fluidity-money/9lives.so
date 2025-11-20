import { requestUnclaimedCampaigns } from "@/providers/graphqlClient";
import { formatUnclaimedCampaign } from "@/utils/format/formatCampaign";
import { useQuery } from "@tanstack/react-query";

export default function useUnclaimedCampaigns(address: string, token?: string) {
  return useQuery({
    queryKey: ["unclaimedCampaigns", address, token],
    queryFn: async () => {
      if (!address) return [];
      return await requestUnclaimedCampaigns(address, token);
    },
    select: (data) => data.map((c) => formatUnclaimedCampaign(c)),
  });
}
