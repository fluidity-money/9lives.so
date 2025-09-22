import { requestComments } from "@/providers/graphqlClient";
import { Comment } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useComments({
  campaignId,
  onlyHolders,
}: {
  campaignId: string;
  onlyHolders: boolean;
}) {
  return useInfiniteQuery<Comment[]>({
    queryKey: ["comments", campaignId, onlyHolders],
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam !== "number") return [];
      const response = await requestComments({
        onlyHolders,
        campaignId,
        page: pageParam,
        pageSize: 10,
      });
      const results = response.filter((a) => !!a);
      return results;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length < 10) return undefined;
      if (typeof lastPageParam !== "number") return undefined;
      return lastPageParam + 1;
    },
  });
}
