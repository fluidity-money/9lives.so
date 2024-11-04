import { Leader } from "@/types";
import { combineClass } from "@/utils/combineClass";

export default function LeaderRow({ data }: { data: Leader }) {
  const cellStyle =
    "border-b border-b-gray-200 font-chicago text-xs text-9black h-16";
  return (
    <tr className="hover:bg-9blueLight/50">
      <td className={combineClass(cellStyle)}>{data.ranking}</td>
      <td className={combineClass(cellStyle)}>{data.wallet}</td>
      <td className={combineClass(cellStyle)}>{data.scoring}</td>
      <td className={combineClass(cellStyle)}></td>
    </tr>
  );
}
