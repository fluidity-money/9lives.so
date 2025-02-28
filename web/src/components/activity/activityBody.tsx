"use client";
import { useActiveAccount } from "thirdweb/react";
import Placeholder from "@/components/tablePlaceholder";
import useAcitivies from "@/hooks/useActivities";
import ActivityRow from "./activityRow";
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
    <tbody>
      {data?.map((item, idx) => (
        <ActivityRow displayCampaignName={!campaignId} key={idx} data={item} />
      ))}
    </tbody>
  );
}
