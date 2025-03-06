import ClaimedRewardsBody from "./claimedRewardsBody";

export default function ClaimedRewardsTable({
  campaignId,
}: {
  campaignId?: string;
}) {
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const tablesHeaders = [
    "Campaign",
    "Winner",
    "Reward",
    "Shares Spent",
    "Date",
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
      <ClaimedRewardsBody campaignId={campaignId} />
    </table>
  );
}
