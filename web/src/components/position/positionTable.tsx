import { PositionsProps } from "@/types";
import PositionsBody from "./positionBody";

export default function PositionTable({
  positionGroups,
  areGroupsLoading,
  detailPage,
  isDpm,
}: {
  positionGroups: PositionsProps[];
  areGroupsLoading?: boolean;
  detailPage?: boolean;
  isDpm?: boolean;
}) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const headers = ["Position", "Current", "Qty", "Value", "PnL"];
  // const headersWithAction = [...headers, "Actions"];
  // const tableHeaders = isDpm ? headers : headersWithAction;
  const tableHeaders = headers;
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
        isDpm={isDpm}
        colSpan={tableHeaders.length}
        detailPage={detailPage}
        positionGroups={positionGroups}
        areGroupsLoading={areGroupsLoading}
      />
    </table>
  );
}
