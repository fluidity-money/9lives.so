import useConnectWallet from "@/hooks/useConnectWallet";
import useTotalPnL from "@/hooks/useTotalPnL";
import { Leader } from "@/types";
import { combineClass } from "@/utils/combineClass";
import formatFusdc from "@/utils/format/formatUsdc";
import Button from "../v2/button";

const rankStyle: Record<number, string> = {
  1: "bg-yellow-200 text-yellow-800",
  2: "bg-neutral-200 text-neutral-700",
  3: "bg-orange-200 text-orange-800",
};

function compactAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function LeaderRow({
  data,
  highlightUser,
}: {
  data?: Leader;
  highlightUser?: boolean;
}) {
  const { connect } = useConnectWallet();
  const { data: history } = useTotalPnL(data?.wallet);
  const pnl = Number(history?.totalPnl ?? 0);
  const cellStyle = "border-b border-neutral-200 px-4 py-3.5 text-sm";

  if (!data) {
    return (
      <tr className="bg-neutral-100">
        <td
          className={combineClass(cellStyle, "font-semibold text-neutral-400")}
        >
          —
        </td>
        <td className={cellStyle}>
          <Button
            intent="inverted"
            size="small"
            title="Connect to see your rank"
            onClick={() => connect()}
          />
        </td>
        <td className={combineClass(cellStyle, "text-right text-neutral-400")}>
          —
        </td>
        <td className={combineClass(cellStyle, "text-right text-neutral-400")}>
          —
        </td>
        <td className={combineClass(cellStyle, "text-right text-neutral-400")}>
          —
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={combineClass(
        "transition-colors hover:bg-neutral-100",
        highlightUser && "bg-neutral-100",
      )}
    >
      <td className={cellStyle}>
        <span
          className={combineClass(
            "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold",
            rankStyle[data.rank] ?? "bg-neutral-100 text-neutral-600",
          )}
        >
          {data.rank}
        </span>
      </td>
      <td className={cellStyle}>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-2black" title={data.wallet}>
            {compactAddress(data.wallet)}
          </span>
          {highlightUser ? (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Your position
            </span>
          ) : null}
        </div>
      </td>
      <td
        className={combineClass(
          cellStyle,
          "text-right font-semibold text-2black",
        )}
      >
        {data.amount.toLocaleString()}
      </td>
      <td
        className={combineClass(
          cellStyle,
          "text-right font-medium",
          pnl >= 0 ? "text-green-600" : "text-red-600",
        )}
      >
        {pnl >= 0 ? "+" : "−"}${formatFusdc(Math.abs(pnl), 2)}
      </td>
      <td
        className={combineClass(
          cellStyle,
          "text-right font-medium text-2black",
        )}
      >
        ${formatFusdc(history?.volume ?? "0", 2)}
      </td>
    </tr>
  );
}
