import useTimePassed from "@/hooks/useTimePassed";
import { Comment, Outcome } from "../../types";
import Button from "../themed/button";
import useDeleteComment from "@/hooks/useDeleteComment";
import DetailCreatedBy from "../detail/detailCreatedBy";
import formatFusdc from "@/utils/format/formatUsdc";
import Image from "next/image";
import makeBlockie from "ethereum-blockies-base64";
import { useAppKitAccount } from "@reown/appkit/react";
import { useSignMessage } from "wagmi";
import { parseSignature } from 'viem';

export default function CommentItem({
  outcomes,
  data,
  campaignId,
  creator,
}: {
  data: Comment;
  campaignId: string;
  creator: string;
  outcomes: Outcome[];
}) {
  const timePassed = useTimePassed(data.createdAt * 1000);
  const account = useAppKitAccount();
  const { mutateAsync: signMessage } = useSignMessage()
  const { mutate, isPending } = useDeleteComment(campaignId);
  const deleteComment = async () => {
    if (!account.address) throw new Error("No wallet is connected.");
    const message = `Deleting a comment on https://9lives.so/campaign/${campaignId}\n${data.content}`;
    const signature = await signMessage({
      message,
    });
    if (!signature) throw new Error("Signature not found");
    const { r: rr, s, v } = parseSignature(signature);
    if (!rr || !s || !v) throw new Error("Signature can not be splitted");
    mutate({
      id: data.id,
      content: data.content,
      walletAddress: account.address,
      rr,
      s,
      v: Number(v),
    });
  };
  return (
    <li className="flex justify-between gap-2.5">
      <div className="flex gap-2.5">
        <Image
          alt={""}
          width={36}
          height={36}
          className="size-9 shrink-0 border border-9black bg-9gray"
          src={makeBlockie(data.walletAddress)}
        />
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <DetailCreatedBy
              prefix={false}
              address={data.walletAddress as `0x${string}`}
              isCreator={creator === data.walletAddress}
            />
            {data.investments.length > 0
              ? data.investments.map((i) => {
                const outcome = outcomes?.find((o) => o.identifier === i?.id);
                return (
                  <span
                    key={i?.id}
                    className="ml-1 max-w-[150px] truncate bg-9green p-0.5 font-geneva text-[10px] font-normal uppercase tracking-wide"
                  >
                    ${+formatFusdc(i?.amount ?? 0, 1)} {outcome?.name}
                  </span>
                );
              })
              : null}
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
