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
import ArrowIcon from "../arrowIcon";

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
  const cost = Number(
    formatFusdc(
      positionsHistory?.reduce((acc, v) => acc + v.fromAmount, 0) ?? 0,
      2,
    ),
  );
  const PnL = cost ? (isWinning ? shares + boost - cost : -cost + refund) : 0;
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-lg bg-neutral-200 p-1">
      <div
        className={combineClass(
          isWinning ? "bg-green-50" : "bg-red-50",
          "flex flex-1 items-center justify-center rounded-lg p-1",
        )}
      >
        <div
          className={combineClass(
            isWinning ? "text-green-600" : "text-red-600",
            "flex items-center gap-1",
          )}
        >
          <span
            className={combineClass(
              isWinning ? "text-green-600" : "text-red-600",
              "text-xs font-semibold",
            )}
          >{`Currently ${isWinning ? "Winning" : "Losing"}`}</span>
          <ArrowIcon variant={isWinning ? "up" : "down"} />
        </div>
      </div>
      <div className="flex flex-col gap-1 rounded-md bg-2white px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-neutral-400">
              Position
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-2black">
              {position.name}{" "}
              <ArrowIcon variant={position.name === "Down" ? "down" : "up"} />
            </span>
          </div>
          <div className="flex flex-col justify-end">
            <span className="text-right text-[9px] font-bold text-neutral-400">
              {isWinning ? "To win" : "To lose"}
            </span>
            <span
              className={combineClass(
                isWinning ? "text-green-700" : "text-red-700",
                "text-xs font-semibold",
              )}
            >
              {isWinning ? `+ $${shares}` : `- $${cost}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-neutral-400">
              {isWinning ? "Bonus" : "Refund"}
            </span>
            <span
              className={combineClass(
                isWinning ? "text-green-700" : "text-red-700",
                "text-xs font-semibold",
              )}
            >
              {isWinning ? `+ $${boost}` : `+ ${refund}`}
            </span>
          </div>
          <div className="flex flex-col justify-end">
            <span className="text-right text-[9px] font-bold text-neutral-400">
              PnL / Cost
            </span>
            {PnL ? (
              <span
                className={combineClass(
                  PnL > 0 ? "text-green-700" : "text-red-700",
                  "text-xs font-semibold",
                )}
              >
                {PnL > 0 ? "+" : "-"}${Math.abs(PnL).toFixed(2)}
                <span className="text-neutral-400"> / ${cost}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimplePositions({
  data,
  openModal,
}: {
  data: SimpleCampaignDetail;
  openModal: () => void;
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
    <div className="mt-4">
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
        <div className="rounded-lg bg-neutral-200 p-1">
          <div className="flex h-[90px] flex-1 flex-col items-center justify-center gap-2 rounded-md bg-2white px-2 py-1">
            <p className="text-sm text-neutral-400">No Positons Yet</p>
            <Button
              title="Buy a Position"
              intent="inverted"
              size="small"
              onClick={openModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
