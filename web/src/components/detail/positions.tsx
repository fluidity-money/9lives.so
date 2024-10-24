import { Outcome } from "@/types";
import dynamic from "next/dynamic";
const PositionsBody = dynamic(() => import("./positionsBody"), { ssr: false });

interface PositionsProps {
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
}
export default function Positions({ tradingAddr, outcomes }: PositionsProps) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = ["Position", "Qty", "Value", "Return"];

  return (
    <div>
      <div className="inline rounded-t-md border-x border-t border-black bg-9layer px-2 py-1 font-chicago text-xs">
        My Campaign Positions
      </div>
      <div className="rounded-[3px] rounded-tl-none border border-9black p-5 shadow-9card">
        <table className="w-full">
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
