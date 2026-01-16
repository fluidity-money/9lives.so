"use client";
import { useState } from "react";
import RetroCard from "./cardRetro";
import Button from "./themed/button";
import Link from "next/link";
import config from "@/config";
import { useAppKitAccount } from "@reown/appkit/react";

export default function BetaTesterInvitation() {
  const account = useAppKitAccount();
  const isBetaTester =
    !!account.address &&
    config.betaTesterWallets.includes(account.address.toLowerCase());
  const [dismissed, setDismissed] = useState(false);
  const isClosed = dismissed || !isBetaTester;

  if (isClosed) return null;

  return (
    <div className="fixed bottom-4 right-4">
      <RetroCard
        title="Join to the future of 9lives.so"
        onClose={() => setDismissed(true)}
        className="max-w-[300px]"
      >
        <p className="mb-4 text-center font-chicago text-xs">
          You have been invited to join an alpha channel for 9lives that will
          allow you to provide feedback and shape the future of 9lives.
          <br />
          <br />
          Join the discord channel to learn more.
        </p>
        <Link href="https://discord.gg/CBZz7k7gT2" target="_blank">
          <Button title="Join" intent={"cta"} className={"w-full"} />
        </Link>
      </RetroCard>
    </div>
  );
}
