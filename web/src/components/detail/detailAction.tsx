import Button from "@/components/themed/button";
import React, { useState } from "react";
import Image from "next/image";
import CatImage from "#/images/cat.png";
import { combineClass } from "@/utils/combineClass";
import Input from "../themed/input";
import { Outcome, SelectedOutcome } from "@/types";
import useBuy from "@/hooks/useBuy";
import { useActiveAccount } from "thirdweb/react";

export default function DetailCall2Action({
  tradingAddr,
  initalData,
  selectedOutcome,
  setSelectedOutcome,
}: {
  selectedOutcome: SelectedOutcome;
  setSelectedOutcome: React.Dispatch<SelectedOutcome>;
  tradingAddr: `0x${string}`;
  initalData: Outcome[];
}) {
  const [value, setValue] = useState(0);
  const account = useActiveAccount();
  const outcome = selectedOutcome
    ? initalData.find((o) => o.identifier === selectedOutcome.id)!
    : initalData[0];
  const ctaTitle = selectedOutcome?.state === "sell" ? "Sell" : "Buy";
  const [isMinting, setIsMinting] = useState(false);

  const buy = useBuy({
    tradingAddr,
    account,
    outcomeId: outcome.identifier,
    value,
  });

  async function handleBuy() {
    try {
      setIsMinting(true);
      const response = await buy();
      console.log("response", response);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    } finally {
      setIsMinting(false);
    }
  }

  return (
    <div className="sticky top-0 flex flex-col gap-4 rounded-[3px] border border-9black p-4 shadow-9card bg-9layer">
      <div className="flex items-center gap-4">
        <Image
          width={40}
          height={40}
          alt={outcome.name}
          src={CatImage}
          className="rounded-full"
        />
        <h3 className="font-chicago text-base font-normal text-9black">
          {outcome.name}
        </h3>
      </div>
      <div>
        <span className="font-chicago text-xs font-normal text-9black">
          Outcome
        </span>
        <div className="mt-2 flex items-center gap-2">
          <Button
            title="Buy"
            intent={selectedOutcome?.state === "buy" ? "yes" : "default"}
            size={"large"}
            className={combineClass(
              selectedOutcome?.state === "buy" &&
                "bg-green-500 text-white hover:bg-green-500",
              "flex-1",
            )}
            onClick={() =>
              setSelectedOutcome({ ...selectedOutcome, state: "buy" })
            }
          />
          <Button
            title="Sell"
            intent={selectedOutcome?.state === "sell" ? "no" : "default"}
            size={"large"}
            className={combineClass(
              selectedOutcome?.state === "sell" &&
                "bg-red-500 text-white hover:bg-red-500",
              "flex-1",
            )}
            onClick={() =>
              setSelectedOutcome({ ...selectedOutcome, state: "sell" })
            }
          />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-chicago text-xs font-normal text-9black">
          Shares
        </span>
        <Input
          type="number"
          onChange={(e) => setValue(Number(e.target.value))}
          min={0}
          className={"mt-2 flex-1 text-center"}
          value={value}
        />
      </div>
      <div className="flex flex-col">
        <span className="font-chicago text-xs font-normal text-9black">
          Leverage
        </span>
        <Input type="range" intent="range" className={"mt-2 w-full"} disabled />
      </div>
      <Button
        disabled={isMinting}
        title={isMinting ? "Loading.." : ctaTitle}
        className={"uppercase"}
        size={"xlarge"}
        intent={"cta"}
        onClick={handleBuy}
      />
    </div>
  );
}
