import { useForm } from "react-hook-form";
import Input from "../themed/input";
import z from "zod";
import Button from "../themed/button";
import usePostComment from "@/hooks/usePostComment";
import { useActiveAccount } from "thirdweb/react";
import { zodResolver } from "@hookform/resolvers/zod";
import useConnectWallet from "@/hooks/useConnectWallet";
import { combineClass } from "@/utils/combineClass";
import ErrorInfo from "../themed/errorInfo";

export default function CommentComposer({
  campaignId,
}: {
  campaignId: string;
}) {
  const { connect } = useConnectWallet();
  const account = useActiveAccount();
  const formSchema = z.object({
    content: z
      .string()
      .min(3, "Your comments have to be longer than 3 charachters.")
      .max(2000, "Your comments have to be shorter than 2000 charachters."),
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
  function handlePost(input: FormData) {
    if (!account) throw new Error("No wallet is connected.");
    postComment({ content: input.content, walletAddress: account?.address });
  }
  const handleClick = () => (!account ? connect() : handleSubmit(handlePost)());
  return (
    <>
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
    </>
  );
}
