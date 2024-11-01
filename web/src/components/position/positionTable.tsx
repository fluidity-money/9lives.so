import { Outcome } from "@/types";
import PositionsBody from "./positionsBody";
interface PositionsProps {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
}
export default function PositionTable({
  tradingAddr,
  outcomes,
}: PositionsProps) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = [
    "Position",
    "Amount of Shares",
    "Value of Shares",
    "Actions",
  ];

  return (
    <table className="w-full table-auto border-separate border-spacing-y-1">
      <thead>
        <tr className="font-geneva">
          {tablesHeaders.map((key) => (
            <th className={tableHeaderClasses} key={key}>
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <PositionsBody tradingAddr={tradingAddr} outcomes={outcomes} />
    </table>
  );
}
