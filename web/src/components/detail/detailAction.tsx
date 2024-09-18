import Button from "@/components/themed/button";
import { SelectedBet } from "../campaign/campaignItem";
import { useState } from "react";
import Image from "next/image";
import CatImage from "#/images/cat.png";
import { combineClass } from "@/utils/combineClass";
import Input from "../themed/input";

export default function DetailCall2Action({
  data,
  setSelectedBet,
}: {
  data: SelectedBet;
  setSelectedBet: React.Dispatch<SelectedBet>;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  return (
    <div className="sticky top-0 flex flex-col gap-4 rounded-[3px] border border-9black p-4 shadow-9card">
      <div className="flex items-center gap-4">
        <Image
          width={40}
          height={40}
          alt={data.name}
          src={CatImage}
          className="rounded-full"
        />
        <h3 className="font-chicago text-base font-normal text-9black">
          {data.name}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        <Button
          cat={"secondary"}
          size={"small"}
          title="Buy"
          className={combineClass(
            side === "buy" && "hover:bg-bg-neutral-50 bg-neutral-50",
          )}
          onClick={() => setSide("buy")}
        />
        <Button
          cat={"secondary"}
          size={"small"}
          title="Sell"
          className={combineClass(
            side === "sell" && "bg-neutral-50 hover:bg-neutral-50",
          )}
          onClick={() => setSide("sell")}
        />
      </div>
      <div>
        <span className="font-chicago text-xs font-normal text-9black">
          Outcome
        </span>
        <div className="mt-2 flex items-center gap-2">
          <Button
            title="Bet Yes"
            intent={data.bet ? "yes" : "default"}
            size={"large"}
            className={combineClass(
              data.bet && "bg-green-500 text-white hover:bg-green-500",
              "flex-1",
            )}
            onClick={() => setSelectedBet({ ...data, bet: true })}
          />
          <Button
            title="Bet No"
            intent={!data.bet ? "no" : "default"}
            size={"large"}
            className={combineClass(
              !data.bet && "bg-red-500 text-white hover:bg-red-500",
              "flex-1",
            )}
            onClick={() => setSelectedBet({ ...data, bet: false })}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-chicago text-xs font-normal text-9black">
          Limit
        </span>
        <Input
          type="number"
          className={"mt-2 flex-1 text-center"}
          defaultValue={0}
        />
      </div>
      <div className="flex flex-col">
        <span className="font-chicago text-xs font-normal text-9black">
          Leverage
        </span>
        <Input type="range" intent="range" className={"mt-2 w-full"} disabled />
      </div>
      <Button
        title={side}
        className={"uppercase"}
        size={"xlarge"}
        intent={"cta"}
        onClick={() => window.alert("You clicked the button!")}
      />
    </div>
  );
}
