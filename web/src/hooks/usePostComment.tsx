import { postComment } from "@/providers/graphqlClient";
import { Comment } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
export default function usePostComment(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["postComment", campaignId],
    mutationFn: async ({
      walletAddress,
      content,
      rr,
      s,
      v,
    }: {
      walletAddress: string;
      content: string;
      rr: string;
      s: string;
      v: number;
    }) =>
      postComment({
        campaignId,
        walletAddress,
        content,
        rr: rr.slice(2),
        s: s.slice(2),
        v,
      }),
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: ["comments", campaignId],
      });
      const previousComments = queryClient.getQueryData<{
        pages: Comment[][];
        pageParams: number[];
      }>(["comments", campaignId]) ?? { pageParams: [0], pages: [[]] };
      const [firstPage, ...rest] = previousComments?.pages;
      const newComments = {
        pageParams: previousComments?.pageParams,
        pages: [
          [
            { ...newComment, id: -1, createdAt: Math.floor(Date.now() / 1000) },
            ...firstPage,
          ],
          ...rest,
        ],
      };
      // Optimistically update the cache
      queryClient.setQueryData(["comments", campaignId], newComments);
      toast.success("Comment posted.");
      // Return context to roll back
      return { previousComments };
    },
    onError: (err, newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", campaignId],
          context.previousComments,
        );
      }
      toast.error(
        err instanceof Error ? err.message : "Unknown error on posting comment",
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", campaignId],
      });
    },
  });
}
