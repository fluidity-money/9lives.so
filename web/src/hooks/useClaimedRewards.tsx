import { requestUserClaims } from "@/providers/graphqlClient";
import { formatClaimedCampaign } from "@/utils/format/formatCampaign";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export default function useClaimedRewards(
  address?: string,
  campaignId?: string,
) {
  return useInfiniteQuery({
    queryKey: ["claimedRewards", address, campaignId],
    queryFn: async ({ pageParam }) => {
      if (!address) return [];
      return await requestUserClaims({
        address,
        campaignId,
        page: pageParam,
        pageSize: 10,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < 10) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
    select: (ro) => ({
      pages: ro.pages.map((p) => p.map((sp) => formatClaimedCampaign(sp))),
      pageParams: ro.pageParams,
    }),
  });
}
