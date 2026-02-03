import useConnectWallet from "@/hooks/useConnectWallet";
import { Leader } from "@/types";
import { combineClass } from "@/utils/combineClass";
import Button from "../themed/button";
import useTotalPnL from "@/hooks/useTotalPnL";
import formatFusdc from "@/utils/format/formatUsdc";

export default function LeaderRow({
  data,
  highlightUser,
}: {
  data?: Leader;
  highlightUser?: boolean;
}) {
  const cellStyle =
    "border-b border-b-gray-200 font-chicago text-xs text-9black h-16";
  const { connect } = useConnectWallet();
  const { data: totalPnL } = useTotalPnL(data?.wallet);
  if (!data)
    return (
      <tr className="cursor-pointer bg-9blueLight/50" onClick={() => connect()}>
        <td className={combineClass(cellStyle)}>???</td>
        <td className={combineClass(cellStyle)}>
          <Button
            intent={"default"}
            title="Connect your wallet to see your rank"
          />
        </td>
        <td className={combineClass(cellStyle)}>???</td>
        <td className={combineClass(cellStyle)}></td>
      </tr>
    );

  return (
    <tr
      className={combineClass(
        highlightUser && "bg-9blueLight/50",
        "hover:bg-9blueLight/50",
      )}
    >
      <td className={combineClass(cellStyle)}>{data.rank}</td>
      <td className={combineClass(cellStyle)}>
        <span className="block w-[100px] truncate sm:w-[160px] lg:w-full">
          {data.wallet}
        </span>
        {highlightUser && (
          <span className="font-arial text-[#808080]">
            🎉 You placed #{data.rank} 🎉
          </span>
        )}
      </td>
      <td className={combineClass(cellStyle)}>{data.amount}</td>
      <td
        className={combineClass(
          cellStyle,
          Number(totalPnL) >= 0 ? "text-green-700" : "text-red-700",
        )}
      >{`$${formatFusdc(totalPnL, 2)}`}</td>
    </tr>
  );
}
