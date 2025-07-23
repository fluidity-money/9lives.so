import { PositionsProps } from "@/types";
import PositionsBody from "./positionBody";

export default function PositionTable({
  positionGroups,
  areGroupsLoading,
  detailPage,
  isDetailDpm,
}: {
  positionGroups: PositionsProps[];
  areGroupsLoading?: boolean;
  detailPage?: boolean;
  isDetailDpm: boolean | null;
}) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const headers = ["Position", "Current", "Qty", "Value", "PnL"];
  const headersWithWin = [...headers, "To Win"];
  const tableHeaders = isDetailDpm ? headers : headersWithWin;
  return (
    <table className="w-full table-auto border-separate border-spacing-y-1">
      <thead>
        <tr className="font-geneva">
          {tableHeaders.map((key) => (
            <th className={tableHeaderClasses} key={key}>
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <PositionsBody
        colSpan={tableHeaders.length}
        detailPage={detailPage}
        positionGroups={positionGroups}
        areGroupsLoading={areGroupsLoading}
      />
    </table>
  );
}
