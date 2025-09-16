import { useForm } from "react-hook-form";
import Input from "../themed/input";
import z from "zod";
import Button from "../themed/button";
import usePostComment from "@/hooks/usePostComment";
import { useActiveAccount } from "thirdweb/react";
import { zodResolver } from "@hookform/resolvers/zod";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function CommentComposer({
  campaignId,
}: {
  campaignId: string;
}) {
  const { connect } = useConnectWallet();
  const account = useActiveAccount();
  const formSchema = z.object({
    content: z.string().min(10).max(2000),
  });
  type FormData = z.infer<typeof formSchema>;
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const { mutate: postComment } = usePostComment(campaignId);
  function handlePost(input: FormData) {
    if (!account) throw new Error("No wallet is connected.");
    postComment({ content: input.content, walletAddress: account?.address });
  }
  const handleClick = () => (!account ? connect() : handleSubmit(handlePost)());
  return (
    <div className="flex items-center">
      <Input type="text" {...register("content")} />
      <Button onClick={handleClick} title="Post" />
    </div>
  );
}
