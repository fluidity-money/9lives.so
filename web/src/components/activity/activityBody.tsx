"use client";
import { useActiveAccount } from "thirdweb/react";
import Placeholder from "@/components/tablePlaceholder";
import useAcitivies from "@/hooks/useActivities";
import ActivityRow from "./activityRow";
interface ActivityBodyProps {
  campaignId?: string;
}
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
      <tbody>
        <Placeholder title="Loading..." />
      </tbody>
    );
  if (isError)
    return (
      <tbody>
        <Placeholder title="Whoops, error!" subtitle={error.message} />
      </tbody>
    );
  if (data?.length === 0)
    return (
      <tbody>
        <Placeholder
          title="Nothing yet."
          subtitle="Start Growing Your Portfolio."
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
