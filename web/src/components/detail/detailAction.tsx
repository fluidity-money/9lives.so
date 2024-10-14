"use client";
import Button from "@/components/themed/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import CatImage from "#/images/cat.png";
import { combineClass } from "@/utils/combineClass";
import Input from "../themed/input";
import { Outcome } from "@/types";
import { useOutcomeStore } from "@/stores/outcomeStore";
import useTradingTx from "@/hooks/useTradingTx";
import { useActiveAccount } from "thirdweb/react";
export default function DetailCall2Action({
  tradingAddr,
  initalData,
}: {
  tradingAddr: `0x${string}`;
  initalData: Outcome[];
}) {
  const selectOutcome = useOutcomeStore((s) => s.selectOutcome);
  const selectedOutcome = useOutcomeStore((s) => s.selectedOutcome);
  const reset = useOutcomeStore((s) => s.reset);
  const account = useActiveAccount();
  const outcome = initalData[selectedOutcome.outcomeIdx];
  const ctaTitle = !!selectedOutcome.state ? 'Buy': 'Sell'
  const [isMinting, setIsMinting] = useState(false);

  const sendTransaction = useTradingTx({
    tradingAddr,
    account,
    outcomeId: outcome.identifier,
    value: 0,
  });

  async function handleBuy() {
    try {
      if (!account) return console.error("No account");
      setIsMinting(true);
      const signature = await account?.signMessage({
        message: "Mint with your permission",
      });
      if (!signature) return console.error("No signature");
      const response = await sendTransaction(signature);
      console.log("response", response);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    } finally {
      setIsMinting(false);
    }
  }

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <div className="sticky top-0 flex flex-col gap-4 rounded-[3px] border border-9black p-4 shadow-9card">
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
            intent={!!selectedOutcome.state ? "yes" : "default"}
            size={"large"}
            className={combineClass(
              !!selectedOutcome.state &&
                "bg-green-500 text-white hover:bg-green-500",
              "flex-1",
            )}
            onClick={() => selectOutcome({ ...selectedOutcome, state: 1 })}
          />
          <Button
            title="Sell"
            intent={!!selectedOutcome.state ? "no" : "default"}
            size={"large"}
            className={combineClass(
              !selectedOutcome.state &&
                "bg-red-500 text-white hover:bg-red-500",
              "flex-1",
            )}
            onClick={() => selectOutcome({ ...selectedOutcome, state: 0 })}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-chicago text-xs font-normal text-9black">
          Shares
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
