"use client";
import { useEffect, useState } from "react";
import RetroCard from "./cardRetro";
import Button from "./themed/button";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import config from "@/config";

export default function BetaTesterInvitation() {
  const [isClosed, setIsClosed] = useState(true);
  const account = useActiveAccount();
  useEffect(() => {
    if (
      account &&
      config.betaTesterWallets.includes(account.address.toLowerCase())
    ) {
      setIsClosed(false);
    }
  }, [account]);

  if (isClosed) return null;

  return (
    <div className="fixed bottom-4 right-4">
      <RetroCard
        title="Join to the future of 9lives.so"
        onClose={() => setIsClosed(true)}
        className="max-w-[300px]"
      >
        <p className="mb-4 text-center font-chicago text-xs">
          You have been invited to join an alpha channel for 9lives that will
          allow you to provide feedback and shape the future of 9lives.
          <br />
          <br />
          Join the discord channel to learn more.
        </p>
        <Link href="https://discord.gg/m6DrTTXD" target="_blank">
          <Button title="Join" intent={"cta"} className={"w-full"} />
        </Link>
      </RetroCard>
    </div>
  );
}
