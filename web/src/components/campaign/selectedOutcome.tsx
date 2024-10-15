"use client";

import Image from "next/image";
import CatImage from "#/images/cat.png";
import Button from "../themed/button";
import Input from "../themed/input";
import { useState } from "react";
import Link from "next/link";
import CloseButton from "../closeButton";
import { Outcome, SelectedOutcome as SelectedOutcomeType } from "@/types";

export default function SelectedOutcome({
  campaignId,
  data,
  selectedState,
  setSelectedOutcome,
}: {
  campaignId: string;
  data: Outcome;
  selectedState: SelectedOutcomeType["state"];
  setSelectedOutcome: React.Dispatch<SelectedOutcomeType | undefined>;
}) {
  const [deposit, setDeposit] = useState(0);

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={CatImage}
            width={28}
            height={28}
            alt={data!.name}
            className="rounded-md"
          />
          <Link href={`/campaign/${campaignId}`}>
            <span className="font-chicago text-sm font-normal text-9black">
              {data!.name}
            </span>
          </Link>
        </div>
        <CloseButton onClick={() => setSelectedOutcome(undefined)} />
      </div>
      <div className="flex items-center justify-center gap-1">
        <Input
          className={"w-full"}
          defaultValue={0}
          min={0}
          type="number"
          value={deposit}
          onChange={(e) => setDeposit(Number(e.target.value))}
        />
        <Input
          type="range"
          intent="range"
          value={deposit}
          min={0}
          max={10}
          className={"w-full"}
          onChange={(e) => setDeposit(Number(e.target.value))}
        />
      </div>
      <Button
        intent={"cta"}
        size={"large"}
        title="Deposit"
        onClick={() => window.alert("You clicked the button!")}
      />
    </div>
  );
}
