import { Outcome } from "@/types";
import PositionsBody from "./positionsBody";
interface PositionsProps {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
}
export default function Positions({ tradingAddr, outcomes }: PositionsProps) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = ["Position", "Invested Amount", "Actions"];

  return (
    <div>
      <div className="inline rounded-t-md border-x border-t border-black bg-9layer px-2 py-1 font-chicago text-xs">
        My Campaign Positions
      </div>
      <div className="rounded-[3px] rounded-tl-none border border-9black p-5 shadow-9card">
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
      </div>
    </div>
  );
}
