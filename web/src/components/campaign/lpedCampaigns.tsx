import { useActiveAccount } from "thirdweb/react";
import Placeholder from "../tablePlaceholder";
import useUserLPs from "@/hooks/useUserLPs";
import UserLpedCampaignsListItem from "./lpedCampaignsItem";

export default function UserLpedCampaignsList() {
  const headerItems = [
    "Campaign",
    "Provided Liquidity",
    "Unclaimed Rewards",
    "Actions",
  ];
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const bodyStyles = "min-h-24 bg-9gray";
  const account = useActiveAccount();
  const {
    data: campaigns,
    isError,
    error,
    isLoading,
  } = useUserLPs(account?.address);
  return (
    <table className="w-full table-auto border-separate border-spacing-y-1">
      <thead>
        <tr className="font-geneva">
          {headerItems.map((key) => (
            <th className={tableHeaderClasses} key={key}>
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={bodyStyles}>
        {isError ? (
          <Placeholder
            colSpan={headerItems.length}
            title="Whoops, error!"
            subtitle={error.message}
          />
        ) : isLoading ? (
          <Placeholder title="Loading.." colSpan={headerItems.length} />
        ) : campaigns?.length === 0 ? (
          <Placeholder
            title="Nothing yet."
            subtitle="Start Growing Your Portfolio."
            colSpan={headerItems.length}
          />
        ) : (
          campaigns?.map(({ campaign: data, liquidity }) => (
            <UserLpedCampaignsListItem
              key={data!.identifier}
              data={data!}
              liquidity={liquidity!}
            />
          ))
        )}
      </tbody>
    </table>
  );
}
