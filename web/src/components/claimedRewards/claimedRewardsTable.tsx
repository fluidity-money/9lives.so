import ClaimedRewardsBody from "./claimedRewardsBody";

export default function ClaimedRewardsTable({
  campaignId,
  modern = false,
}: {
  campaignId?: string;
  modern?: boolean;
}) {
  const tableHeaderClasses = modern
    ? "px-3 py-2 text-left text-xs font-medium text-neutral-400"
    : "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
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
        <tr className={modern ? "font-sans" : "font-geneva"}>
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
