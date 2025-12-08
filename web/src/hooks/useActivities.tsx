import { requestUserActivities } from "@/providers/graphqlClient";
import { Activity, RawActivity } from "@/types";
import formatActivity from "@/utils/format/formatActivity";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useAcitivies({
  address,
  campaignId,
}: {
  address?: string;
  campaignId?: string;
}) {
  return useInfiniteQuery<
    RawActivity[],
    unknown,
    { pages: Activity[][]; pageParams: unknown[] }
  >({
    queryKey: ["activities", address, campaignId],
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam !== "number") return [];
      if (!address) return [];
      return await requestUserActivities({
        address,
        campaignId,
        page: pageParam,
        pageSize: 10,
      });
    },
    select: (ro) => ({
      pages: ro.pages.map((p) => p.map((sp) => formatActivity(sp))),
      pageParams: ro.pageParams,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < 10) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
}
