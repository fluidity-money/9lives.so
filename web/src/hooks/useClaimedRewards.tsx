import { requestUserClaims } from "@/providers/graphqlClient";
import { useQuery } from "@tanstack/react-query";

export default function useClaimedRewards(
  address?: string,
  campaignId?: string,
) {
  return useQuery({
    queryKey: ["claimedRewards", address, campaignId],
    queryFn: async () => {
      if (!address) return [];
      return await requestUserClaims(address, campaignId);
    },
  });
}
