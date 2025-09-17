import { deleteComment } from "@/providers/graphqlClient";
import { Comment } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
export default function useDeleteComment(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["postComment", campaignId],
    mutationFn: async ({
      id,
      walletAddress,
      content,
      rr,
      s,
      v,
    }: {
      id: number;
      walletAddress: string;
      content: string;
      rr: string;
      s: string;
      v: number;
    }) =>
      deleteComment({
        id,
        walletAddress,
        content,
        rr: rr.slice(2),
        s: s.slice(2),
        v,
      }),
    onMutate: async (comment) => {
      await queryClient.cancelQueries({
        queryKey: ["comments", campaignId],
      });
      const previousComments = queryClient.getQueryData<{
        pages: Comment[][];
        pageParams: number[];
      }>(["comments", campaignId]) ?? { pageParams: [0], pages: [[]] };

      // Write an algo which deletes comments if it is found, in necessary page items
      const newPages = previousComments.pages.map((p) =>
        p.filter((i) => i.id !== comment.id),
      );
      const newComments = {
        pageParams: previousComments.pageParams,
        pages: newPages,
      };

      // Optimistically update the cache
      queryClient.setQueryData(["comments", campaignId], newComments);
      toast.success("Comment deleted.");
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
