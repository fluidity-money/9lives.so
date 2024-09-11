"use client";

import Image from "next/image";
import CatImage from "#/images/cat.png";
import type { SelectedBet } from "./campaignItem";
import Button from "../themed/button";
import Input from "../themed/input";
import { useState } from "react";
import Link from "next/link";

export default function SelectedBet({
  campaignId,
  data,
  setSelectedBet,
}: {
  campaignId: string;
  data: SelectedBet;
  setSelectedBet: React.Dispatch<SelectedBet | undefined>;
}) {
  const [deposit, setDeposit] = useState(0);

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={CatImage}
            width={30}
            height={30}
            alt={data!.name}
            className="rounded-md"
          />
          <Link href={`/event?id=${campaignId}`}>
            <span className="font-bold">{data!.name}</span>
          </Link>
        </div>
        <button
          className="rounded-md bg-gray-200 px-2 py-1 text-xs"
          onClick={() => setSelectedBet(undefined)}
        >
          X
        </button>
      </div>
      <div className="flex items-center justify-center gap-1">
        <Input
          className={"w-full"}
          defaultValue={0}
          type="number"
          value={deposit}
          onChange={(e) => setDeposit(Number(e.target.value))}
        />
        <Input
          type="range"
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