import config from "@/config";
import { requestCampaignList } from "@/providers/graphqlClient";
import { Campaign, CampaignFilters } from "@/types";
import { formatCampaign } from "@/utils/format/formatCampaign";
import { useInfiniteQuery } from "@tanstack/react-query";
export default function useCampaigns({
  category,
  orderBy,
  searchTerm,
  address,
  userList,
}: Omit<CampaignFilters, "category"> & {
  category?: (typeof config.categories)[number];
  userList?: boolean;
}) {
  return useInfiniteQuery<Campaign[]>({
    queryKey: ["campaigns", category, orderBy, searchTerm, address, userList],
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam !== "number") return [];
      if (userList && !address) return [];
      const campaigns = (await requestCampaignList({
        orderBy,
        searchTerm,
        page: pageParam,
        pageSize: pageParam === 0 ? 32 : 8,
        category: category && [category],
        address,
      })) as Campaign[];
      return campaigns.map((campaign) => formatCampaign(campaign));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages, lastPageParam) => {
      if (lastPageParam === 0 && lastPage.length < 32) return undefined;
      if (lastPage.length < 8) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      if (lastPageParam === 0) return 4;
      return lastPageParam + 1;
    },
  });
}
