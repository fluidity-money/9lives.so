"use client";

import Image from "next/image";
import CatImage from "#/images/cat.png";
import type { SelectedBet } from "./campaignItem";
import Button from "../themed/button";
import Input from "../themed/input";

export default function SelectedBet({
  data,
  setSelectedBet,
}: {
  data: SelectedBet;
  setSelectedBet: React.Dispatch<SelectedBet | undefined>;
}) {
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
          <span className="font-bold">{data!.name}</span>
        </div>
        <button
          className="rounded-md bg-gray-200 px-2 py-1 text-xs"
          onClick={() => setSelectedBet(undefined)}
        >
          X
        </button>
      </div>
      <div className="flex items-center justify-center gap-1">
        <Input className={"w-full"} defaultValue={0} type="number" />
        <Input
          type="range"
          defaultValue={0}
          min={0}
          max={10}
          className={"w-full"}
        />
      </div>
      <Button intent={"cta"} size={"large"} title="Deposit" />
    </div>
  );
}
