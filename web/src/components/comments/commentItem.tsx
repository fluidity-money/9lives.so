import useTimePassed from "@/hooks/useTimePassed";
import { Comment } from "../../types";
import Button from "../themed/button";
import { useActiveAccount } from "thirdweb/react";
import useDeleteComment from "@/hooks/useDeleteComment";
import { signMessage } from "thirdweb/utils";
import { Signature } from "ethers";
import DetailCreatedBy from "../detail/detailCreatedBy";
export default function CommentItem({
  data,
  campaignId,
  creator,
}: {
  data: Comment;
  campaignId: string;
  creator: string;
}) {
  const timePassed = useTimePassed(data.createdAt * 1000);
  const account = useActiveAccount();
  const { mutate, isPending } = useDeleteComment(campaignId);
  const deleteComment = async () => {
    if (!account) throw new Error("No wallet is connected.");
    const message = `Deleting a comment on https://9lives.so/campaign/${campaignId}\n${data.content}`;
    const signature = await signMessage({
      message,
      account,
    });
    if (!signature) throw new Error("Signature not found");
    const { r: rr, s, v } = Signature.from(signature);
    if (!rr || !s || !v) throw new Error("Signature can not be splitted");
    mutate({
      id: data.id,
      content: data.content,
      walletAddress: account.address,
      rr,
      s,
      v,
    });
  };
  return (
    <li className="flex justify-between gap-2.5">
      <div className="flex gap-2.5">
        <div className="size-9 shrink-0 border border-9black bg-9gray" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <DetailCreatedBy
              prefix={false}
              address={data.walletAddress as `0x${string}`}
              isCreator={creator === data.walletAddress}
            />
            <span className="text-xs font-bold text-9black/50">
              {timePassed}
            </span>
          </div>
          <p className="text-xs">{data.content}</p>
        </div>
      </div>
      {account?.address?.toLowerCase() === data.walletAddress ? (
        <Button
          intent={"no"}
          size={"small"}
          title={isPending ? "Deleting" : "Del"}
          disabled={isPending}
          className={"self-start"}
          onClick={deleteComment}
        />
      ) : null}
    </li>
  );
}
