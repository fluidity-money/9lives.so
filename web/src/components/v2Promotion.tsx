"use client";
import { useState } from "react";
import RetroCard from "./cardRetro";
import Link from "next/link";
import Button from "./themed/button";

export default function V2Promotion() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4">
      <RetroCard
        title="Version 2 is out!"
        onClose={() => setDismissed(true)}
        className="max-w-[300px]"
      >
        <p className="mb-4 text-center font-chicago text-xs">
          9lives has a new version for you to improve your experience.
          <br />
          <br />
          Try and check it now.
        </p>
        <Link href="/campaign/btc/15mins">
          <Button title="Go to V2" intent={"cta"} className={"w-full"} />
        </Link>
      </RetroCard>
    </div>
  );
}
