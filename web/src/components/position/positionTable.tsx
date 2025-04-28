import { PositionsProps } from "@/types";
import PositionsBody from "./positionBody";

export default function PositionTable({
  positionGroups,
  areGroupsLoading,
  detailPage,
}: {
  positionGroups: PositionsProps[];
  areGroupsLoading?: boolean;
  detailPage?: boolean;
}) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = [
    "Position",
    "Current",
    "Qty",
    "Value",
    "PnL",
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
      <PositionsBody
        detailPage={detailPage}
        positionGroups={positionGroups}
        areGroupsLoading={areGroupsLoading}
      />
    </table>
  );
}
