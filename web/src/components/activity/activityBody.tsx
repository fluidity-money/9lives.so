"use client";
import { useActiveAccount } from "thirdweb/react";
import Placeholder from "@/components/tablePlaceholder";
import useAcitivies from "@/hooks/useActivities";
import ActivityRow from "./activityRow";
import Button from "../themed/button";
interface ActivityBodyProps {
  campaignId?: string;
}
const bodyStyles = "min-h-24 bg-9gray";

export default function ActivityBody({ campaignId }: ActivityBodyProps) {
  const account = useActiveAccount();
  const {
    data: activities,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAcitivies({ address: account?.address, campaignId });
  const data = activities?.pages.flatMap((c) => c);

  if (isLoading)
    return (
      <tbody className={bodyStyles}>
        <Placeholder title="Loading..." colSpan={6} />
      </tbody>
    );
  if (isError)
    return (
      <tbody className={bodyStyles}>
        <Placeholder
          title="Whoops, error!"
          subtitle={error.message}
          colSpan={6}
        />
      </tbody>
    );
  if (data?.length === 0)
    return (
      <tbody className={bodyStyles}>
        <Placeholder
          title="Nothing yet."
          subtitle="Start Growing Your Portfolio."
          colSpan={6}
        />
      </tbody>
    );
  return (
    <tbody className={bodyStyles}>
      {data?.map((item, idx) => (
        <ActivityRow displayCampaignName={!campaignId} key={idx} data={item} />
      ))}
      <tr>
        <td colSpan={6}>
          <div className="flex items-center justify-center">
            {hasNextPage ? (
              <Button
                intent={"cta"}
                disabled={isFetchingNextPage}
                title={isFetchingNextPage ? "Loading" : "Show More"}
                onClick={() => fetchNextPage()}
              />
            ) : (
              <span className="font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
                End of results
              </span>
            )}
          </div>
        </td>
      </tr>
    </tbody>
  );
}
