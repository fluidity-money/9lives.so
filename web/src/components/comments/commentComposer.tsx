import { useForm } from "react-hook-form";
import Input from "../themed/input";
import z from "zod";
import Button from "../themed/button";
import usePostComment from "@/hooks/usePostComment";
import { zodResolver } from "@hookform/resolvers/zod";
import useConnectWallet from "@/hooks/useConnectWallet";
import { combineClass } from "@/utils/combineClass";
import ErrorInfo from "../themed/errorInfo";
import { parseSignature } from 'viem';
import { useAppKitAccount } from "@reown/appkit/react";
import { useSignMessage } from "wagmi";

export default function CommentComposer({
  campaignId,
}: {
  campaignId: string;
}) {
  const { connect } = useConnectWallet();
  const account = useAppKitAccount();
  const { mutateAsync: signMessage } = useSignMessage()
  const formSchema = z.object({
    content: z
      .string()
      .min(3, "Your comments have to be longer than 3 characters.")
      .max(2000, "Your comments have to be shorter than 2000 characters."),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const { mutate: postComment } = usePostComment(campaignId);
  async function handlePost(input: FormData) {
    if (!account.address) throw new Error("No wallet is connected.");
    const message = `Posting a comment on https://9lives.so/campaign/${campaignId}\n${input.content}`;
    const signature = await signMessage({
      message,
    });
    if (!signature) throw new Error("Signature not found");
    const { r: rr, s, v } = parseSignature(signature);
    if (!rr || !s || !v) throw new Error("Signature can not be splitted");
    postComment({
      content: input.content,
      walletAddress: account?.address,
      rr,
      s,
      v: Number(v),
    });
  }
  const handleClick = () => (!account.isConnected ? connect() : handleSubmit(handlePost)());
  return (
    <div className="mb-4">
      <div className="flex gap-2.5">
        <Input
          type="text"
          placeholder="Add a comment"
          {...register("content")}
          className={combineClass(
            "w-full flex-1",
            errors.content && "border-2 border-red-500",
          )}
        />
        <Button onClick={handleClick} title="Post" />
      </div>
      {errors.content && <ErrorInfo text={errors.content.message} />}
    </div>
  );
}
