import useDppmShareEstimation from "@/hooks/useDppmShareEstimation";
import { combineClass } from "@/utils/combineClass";
import formatFusdc from "@/utils/format/formatUsdc";
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
  const [toWin, bonus] = useDppmShareEstimation({
    tradingAddr,
    account,
    outcomeId: position.id,
  });
  return (
    <div
      className={combineClass(
        isPriceAbove ? "bg-9green" : "bg-9red",
        "flex justify-between p-4",
      )}
    >
      <span className="font-chicago uppercase text-9black">
        {isPriceAbove ? "Winning" : "Losing"}
      </span>
      <div className="flex flex-col gap-1 font-chicago text-xs">
        <span>Shares: {position.balance}</span>
        <span>To Win: ${formatFusdc(toWin, 2)}</span>
        <span>Bonus: ${formatFusdc(bonus, 2)}</span>
      </div>
    </div>
  );
}
