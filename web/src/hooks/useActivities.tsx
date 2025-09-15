import { requestUserActivities } from "@/providers/graphqlClient";
import { Activity } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useAcitivies({
  address,
  campaignId,
  page = 0,
  pageSize = 10,
}: {
  address?: string;
  campaignId?: string;
  page?: number;
  pageSize?: number;
}) {
  return useInfiniteQuery<Activity[]>({
    queryKey: ["activities", address, campaignId, page, pageSize],
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam !== "number") return [];
      if (!address) return [];
      const response = await requestUserActivities({
        address,
        campaignId,
        page: pageParam,
        pageSize,
      });
      return response.filter((a) => !!a);
    },
    initialPageParam: page,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < pageSize) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
}
