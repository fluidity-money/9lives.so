import { PositionsProps } from "@/types";
import PositionsBody from "./positionBody";

export default function PositionTable({
  positionGroups,
  areGroupsLoading,
}: {
  positionGroups: PositionsProps[];
  areGroupsLoading?: boolean;
}) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = ["Position", "Current", "Qty", "Value", "Actions"];

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
        positionGroups={positionGroups}
        areGroupsLoading={areGroupsLoading}
      />
    </table>
  );
}
