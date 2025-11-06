import useDppmShareEstimation from "@/hooks/useDppmShareEstimation";
import { combineClass } from "@/utils/combineClass";
import { Account } from "thirdweb/wallets";

export default function SimplePositionRow({
  isConcluded,
  position,
  tradingAddr,
  account,
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
  account?: Account;
}) {
  const {
    data: [shares, boost, refund],
  } = useDppmShareEstimation({
    tradingAddr,
    account,
    outcomeId: position.id,
  });
  const isWinning = position.name === "Up" ? isPriceAbove : !isPriceAbove;
  return (
    <div
      className={combineClass(
        isWinning ? "bg-9green" : "bg-9red",
        "flex justify-between gap-4 p-5 text-xs shadow-9orderSummary",
      )}
    >
      <span className="font-chicago uppercase text-9black">
        My Position: {position.name}
        <br />
        <br />
        Status:{" "}
        {isConcluded
          ? isWinning
            ? "Won"
            : "Lost"
          : `Currently ${isWinning ? " Winning" : "Losing"}`}
      </span>
      <div className="flex flex-col gap-1 text-end font-chicago text-xs">
        <span>Base Reward: ${shares}</span>
        <span>Bonus: ${boost}</span>
        <span>Refund: ${refund}</span>
      </div>
    </div>
  );
}
