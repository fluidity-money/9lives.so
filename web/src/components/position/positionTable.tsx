import PositionsBody from "./positionBody";
import { useState } from "react";
import Button from "../themed/button";
import ModernButton from "../v2/button";
import { CampaignDetail } from "@/types";

export default function PositionTable({
  campaignDetail,
  modern = false,
}: {
  campaignDetail?: CampaignDetail;
  modern?: boolean;
}) {
  const tableHeaderClasses = modern
    ? "px-3 py-2 text-left text-xs font-medium text-neutral-400"
    : "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const headers = ["Position", "Current", "Qty", "Value", "PnL"];
  const headersWithWin = [...headers, "To Win"];
  const tableHeaders = campaignDetail?.isDpm ? headers : headersWithWin;
  const [hideSmallBalances, setHideSmallBalances] = useState<boolean>(true);
  return (
    <>
      <div className="flex items-center justify-end">
        {modern ? (
          <ModernButton
            size="small"
            intent="inverted"
            onClick={() => setHideSmallBalances(!hideSmallBalances)}
            title={
              hideSmallBalances ? "Show small balances" : "Hide small balances"
            }
          />
        ) : (
          <Button
            size="small"
            onClick={() => setHideSmallBalances(!hideSmallBalances)}
            title={
              hideSmallBalances ? "Show Small Balances" : "Hide Small Balances"
            }
          />
        )}
      </div>
      <table className="w-full table-auto border-separate border-spacing-y-1">
        <thead>
          <tr className={modern ? "font-sans" : "font-geneva"}>
            {tableHeaders.map((key) => (
              <th className={tableHeaderClasses} key={key}>
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <PositionsBody
          modern={modern}
          hideSmallBalances={hideSmallBalances}
          colSpan={tableHeaders.length}
          campaignDetail={campaignDetail}
        />
      </table>
    </>
  );
}
