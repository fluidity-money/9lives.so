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
    <div className="sticky top-0 flex flex-col gap-4 rounded-md border border-black/10 p-4 shadow-md">
      <div className="flex items-center gap-4">
        <Image
          width={40}
          height={40}
          alt={data.name}
          src={CatImage}
          className="rounded-full"
        />
        <h3 className="font-bold">{data.name}</h3>
      </div>
      <div className="flex items-center gap-2">
        <Button
          cat={"secondary"}
          size={"small"}
          title="Buy"
          className={combineClass(
            side === "buy" && "bg-blue-500 text-white hover:bg-blue-500",
          )}
          onClick={() => setSide("buy")}
        />
        <Button
          cat={"secondary"}
          size={"small"}
          title="Sell"
          className={combineClass(
            side === "sell" && "bg-blue-500 text-white hover:bg-blue-500",
          )}
          onClick={() => setSide("sell")}
        />
      </div>
      <div>
        <span className="text-base font-bold">Outcome</span>
        <div className="flex items-center gap-2">
          <Button
            title="Bet Yes"
            intent={"yes"}
            size={"medium"}
            className={combineClass(
              data.bet && "bg-green-500 text-white hover:bg-green-500",
              "flex-1",
            )}
            onClick={() => setSelectedBet({ ...data, bet: true })}
          />
          <Button
            title="Bet No"
            intent={"no"}
            size={"medium"}
            className={combineClass(
              !data.bet && "bg-red-500 text-white hover:bg-red-500",
              "flex-1",
            )}
            onClick={() => setSelectedBet({ ...data, bet: false })}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-base font-bold">Limit</span>
        <Input
          type="number"
          className={"flex-1 text-center"}
          defaultValue={0}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-bold">Leverage</span>
        <Input type="range" className={"flex-1"} disabled />
      </div>
      <Button
        title={side}
        className={"uppercase"}
        size={"large"}
        intent={"cta"}
        onClick={() => window.alert("You clicked the button!")}
      />
    </div>
  );
}
