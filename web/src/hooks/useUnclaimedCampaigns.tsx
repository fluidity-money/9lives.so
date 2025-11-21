import { requestUnclaimedCampaigns } from "@/providers/graphqlClient";
import { formatUnclaimedCampaign } from "@/utils/format/formatCampaign";
import { useQuery } from "@tanstack/react-query";

export default function useUnclaimedCampaigns(
  walletAddress?: string,
  token?: string,
) {
  return useQuery({
    queryKey: ["unclaimedCampaigns", walletAddress, token],
    queryFn: async () => {
      if (!walletAddress) return [];
      return await requestUnclaimedCampaigns(walletAddress, token);
    },
    select: (data) => data.map((c) => formatUnclaimedCampaign(c)),
  });
}
