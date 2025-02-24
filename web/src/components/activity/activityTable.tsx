import ActivityBody from "./activityBody";

export default function ActivityTable({ campaignId }: { campaignId?: string }) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = ["Position", "Type", "Price", "Qty", "Cost", "Date"];
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
      <ActivityBody campaignId={campaignId} />
    </table>
  );
}
