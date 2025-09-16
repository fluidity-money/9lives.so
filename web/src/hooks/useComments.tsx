import { requestComments } from "@/providers/graphqlClient";
import { Comment } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useComments({ campaignId }: { campaignId: string }) {
  return useInfiniteQuery<Comment[]>({
    queryKey: ["comments", campaignId],
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam !== "number") return [];
      const response = await requestComments({
        campaignId,
        page: pageParam,
        pageSize: 10,
      });
      return response.filter((a) => !!a);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < 10) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
}
