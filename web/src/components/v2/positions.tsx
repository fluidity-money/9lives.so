"use client";

import usePositions from "@/hooks/usePositions";
import { Outcome, SimpleCampaignDetail } from "@/types";
import useFinalPrice from "@/hooks/useFinalPrice";
import { useAppKitAccount } from "@reown/appkit/react";
import useDppmShareEstimation from "@/hooks/useDppmShareEstimation";
import usePositionHistory from "@/hooks/usePositionsHistory";
import formatFusdc from "@/utils/format/formatUsdc";
import Button from "./button";
import { combineClass } from "@/utils/combineClass";

function PositionItem({
  isConcluded,
  position,
  tradingAddr,
  address,
  isPriceAbove,
}: {
  isConcluded: boolean;
  position: {
    id: `0x${string}`;
    shareAddress: `0x${string}`;
    name: string;
    balance: string;
    balanceRaw: bigint;
  };
  isPriceAbove: boolean;
  tradingAddr: `0x${string}`;
  address?: string;
}) {
  const isWinning = position.name === "Up" ? isPriceAbove : !isPriceAbove;
  const {
    data: [shares, boost, refund],
  } = useDppmShareEstimation({
    tradingAddr,
    address,
    outcomeId: position.id,
    isWinning,
  });
  const { data: positionsHistory } = usePositionHistory(address, [position.id]);
  const cost = positionsHistory?.reduce((acc, v) => acc + v.fromAmount, 0);
  const PnL = cost
    ? isWinning
      ? shares + boost - Number(formatFusdc(cost, 2))
      : -Number(formatFusdc(cost, 2)) + refund
    : 0;
  return (
    <div
      className={combineClass(
        isWinning ? "bg-green-300 text-green-700" : "bg-red-300 text-red-700",
        "flex justify-between gap-4 bg-white p-4 text-xs shadow-9orderSummary",
      )}
    >
      <span className="uppercase text-9black">
        My Position: {position.name}
        <br />
        <br />
        Status:{" "}
        <span
          className={combineClass(
            isWinning
              ? "bg-green-300 text-green-700"
              : "bg-red-300 text-red-700",
            "px-2 py-1",
          )}
        >
          {isConcluded
            ? isWinning
              ? "Won"
              : "Lost"
            : `Currently ${isWinning ? " Winning" : "Losing"}`}
        </span>
      </span>
      <div className="flex flex-col gap-1 text-end text-xs">
        {isWinning ? (
          <>
            <span>To Win: +${shares}</span>
            <span>Bonus: +${boost}</span>
          </>
        ) : (
          <>
            <span>To Lose: -${formatFusdc(cost ?? 0, 2)}</span>
            <span>Refund: +${refund}</span>
          </>
        )}
        {PnL ? (
          <span>
            PnL:{" "}
            <span
              className={combineClass(
                PnL > 0
                  ? "bg-green-300 text-green-700"
                  : "bg-red-300 text-red-700",
                "px-1 py-0.5",
              )}
            >
              {PnL > 0 ? "+" : "-"}${PnL.toFixed(2)}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function SimplePositions({
  data,
}: {
  data: SimpleCampaignDetail;
}) {
  const account = useAppKitAccount();
  const { data: positions } = usePositions({
    tradingAddr: data.poolAddress,
    outcomes: data.outcomes,
    address: account.address,
    isDpm: false,
  });
  const winnerOutcome = data.outcomes.find(
    (o) => o.identifier === data?.winner,
  ) as Outcome;
  const { data: finalPrice } = useFinalPrice({
    symbol: data.priceMetadata.baseAsset,
    starting: data.starting,
    ending: data.ending,
  });
  const basePrice = Number(data.priceMetadata.priceTargetForUp);
  return (
    <div className="my-4">
      <p className="mb-1 text-xs font-semibold text-neutral-400">
        My Positions
      </p>
      {positions && positions.length > 0 ? (
        <div className="flex flex-row gap-2">
          {positions.map((p) => (
            <PositionItem
              isConcluded={!!winnerOutcome}
              isPriceAbove={finalPrice ? finalPrice.price > basePrice : false}
              key={p.id}
              position={p}
              address={account.address}
              tradingAddr={data.poolAddress}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] bg-neutral-200 p-1">
          <div className="flex h-[90px] flex-1 flex-col items-center justify-center gap-2 rounded-md bg-2white px-2 py-1">
            <p className="text-sm text-neutral-400">No Positons Yet</p>
            <Button title="Buy a Position" intent="inverted" size="small" />
          </div>
        </div>
      )}
    </div>
  );
}
