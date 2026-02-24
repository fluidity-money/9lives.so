"use client";
import { useState } from "react";
import Button from "./button";
import Link from "next/link";
import config from "@/config";
import { useAppKitAccount } from "@reown/appkit/react";
import CloseButton from "./closeButton";

export default function BetaTesterInvitation() {
  const account = useAppKitAccount();
  const isBetaTester =
    !!account.address &&
    config.betaTesterWallets.includes(account.address.toLowerCase());
  const [dismissed, setDismissed] = useState(false);
  const isClosed = dismissed || !isBetaTester;

  if (isClosed) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-[300px] rounded-2xl border border-neutral-400 bg-2white p-4 shadow-[2px_2px_8px_0px_rgba(178,178,178,0.50)]">
      <CloseButton close={() => setDismissed(true)} />
      <h6 className="mb-4">Join to the future of 9lives.so</h6>
      <p className="mb-4 text-center text-xs">
        You have been invited to join an alpha channel for 9lives that will
        allow you to provide feedback and shape the future of the app!
        <br />
        <br />
        Join the discord channel to learn more.
      </p>
      <Link href="https://discord.gg/CBZz7k7gT2" target="_blank">
        <Button title="Join" intent={"cta"} className={"w-full"} />
      </Link>
    </div>
  );
}
