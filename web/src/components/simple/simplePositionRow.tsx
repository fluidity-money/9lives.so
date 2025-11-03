import useDppmShareEstimation from "@/hooks/useDppmShareEstimation";
import { combineClass } from "@/utils/combineClass";
import { Account } from "thirdweb/wallets";

export default function SimplePositionRow({
  position,
  tradingAddr,
  account,
  isPriceAbove,
}: {
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
  const [shares, boost, refund] = useDppmShareEstimation({
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
        Status: Currently {isWinning ? "Winning" : "Losing"}
      </span>
      <div className="flex flex-col gap-1 text-end font-chicago text-xs">
        <span>Shares To Get: {position.balance}</span>
        <span>
          {isWinning ? "To Win" : "To Lose"}: ${shares + boost}
        </span>
        <span>
          {isWinning ? "Bonus" : "Refund"}: ${refund}
        </span>
      </div>
    </div>
  );
}
