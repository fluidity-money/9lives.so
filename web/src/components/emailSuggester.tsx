"use client";

import { useEffect, useState } from "react";
import Modal from "./themed/modal";
import { useActiveAccount } from "thirdweb/react";
import useProfile from "@/hooks/useProfile";
import Input from "./themed/input";
import Button from "./themed/button";
import useSynchProfile from "@/hooks/useSynchProfile";
import { z } from "zod";
import { useForm } from "react-hook-form";
import ErrorInfo from "./themed/errorInfo";
import { combineClass } from "@/utils/combineClass";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@/utils/analytics";
import posthog from "posthog-js";

export default function EmailSuggester() {
  const [isOpen, setIsOpen] = useState(false);
  const account = useActiveAccount();
  const {
    data: profile,
    isSuccess: isProfileLoaded,
    refetch,
  } = useProfile(account?.address);
  const { synch, isLoading, isSuccess } = useSynchProfile();
  const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "You have to connect your wallet",
    }),
  });
  type FormData = z.infer<typeof formSchema>;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: account?.address,
      email: "",
    },
  });
  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
      refetch();
      track("email_sub");
    }
  }, [isSuccess]);
  useEffect(() => {
    if (account?.address) setValue("address", account?.address);
  }, [account?.address]);
  useEffect(() => {
    if (account?.address && isProfileLoaded && !profile?.email) {
      setIsOpen(true);
    }
  }, [account?.address, profile, isProfileLoaded]);
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Never Miss an Update!">
      <div className="flex flex-col items-center gap-4">
        <h2 className="font-chicago text-2xl text-9black">
          {posthog.getFeatureFlag("email-subscription-conversion-1") === "test"
            ? "Never Miss an Update!"
            : "Stay in the Loop!"}
        </h2>
        <p className="text-center font-chicago font-normal text-9black">
          {posthog.getFeatureFlag("email-subscription-conversion-1") === "test"
            ? "Add your email to receive notifications on your campaigns, 9Lives portfolio, and important news."
            : "Enter your email to get updates on your campaigns, 9Lives portfolio, and the latest market news—straight to your inbox."}
        </p>
        <p className="text-center font-chicago font-normal text-9black">
          Also get an exclusive achievement!
        </p>
        <Input
          {...register("email")}
          type="email"
          placeholder="Enter your email address"
          className={combineClass(
            "w-full flex-1 text-center",
            errors.email || (errors.address && "border-2 border-red-500"),
          )}
        />
        {errors.email && <ErrorInfo text={errors.email.message} />}
        {errors.address && <ErrorInfo text={errors.address.message} />}
        <Button
          title={"Submit"}
          onClick={handleSubmit(synch)}
          disabled={isLoading}
          intent={"yes"}
          className={"w-full"}
          size={"large"}
        />
      </div>
    </Modal>
  );
}
