import useDppmShareEstimation from "@/hooks/useDppmShareEstimation";
import usePositionHistory from "@/hooks/usePositionsHistory";
import { combineClass } from "@/utils/combineClass";
import formatFusdc from "@/utils/format/formatUsdc";

export default function SimplePositionRow({
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
  const { data: positionsHistory } = usePositionHistory(address, [
    position.id,
  ]);
  const cost = positionsHistory?.reduce((acc, v) => acc + v.fromAmount, 0);
  const PnL = cost
    ? isWinning
      ? shares + boost - Number(formatFusdc(cost, 2))
      : -Number(formatFusdc(cost, 2)) + refund
    : 0;
  return (
    <div
      className={combineClass(
        isWinning ? "bg-9green" : "bg-9red",
        "flex justify-between gap-4 bg-white p-4 text-xs shadow-9orderSummary",
      )}
    >
      <span className="font-chicago uppercase text-9black">
        My Position: {position.name}
        <br />
        <br />
        Status:{" "}
        <span
          className={combineClass(
            isWinning ? "bg-9green" : "bg-9red",
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
      <div className="flex flex-col gap-1 text-end font-chicago text-xs">
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
                PnL > 0 ? "bg-9green" : "bg-9red",
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
