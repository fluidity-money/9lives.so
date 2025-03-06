"use client";

import { useActiveAccount } from "thirdweb/react";
import ClaimedRewardsRow from "./claimedRewardsRow";
import useClaimedRewards from "@/hooks/useClaimedRewards";
import Placeholder from "../tablePlaceholder";
const bodyStyles = "min-h-24 bg-9gray";

export default function ClaimedRewardsBody({
  campaignId,
}: {
  campaignId?: string;
}) {
  const account = useActiveAccount();
  const {
    isLoading,
    isError,
    error,
    data: claimedRewards,
  } = useClaimedRewards(account?.address, campaignId);
  if (isLoading)
    return (
      <tbody className={bodyStyles}>
        <Placeholder title="Loading..." />
      </tbody>
    );
  if (isError)
    return (
      <tbody className={bodyStyles}>
        <Placeholder title="Whoops, error!" subtitle={error.message} />
      </tbody>
    );
  if (claimedRewards?.length === 0)
    return (
      <tbody className={bodyStyles}>
        <Placeholder
          title="No Rewards Yet."
          subtitle="Start Growing Your Portfolio."
        />
      </tbody>
    );

  return (
    <tbody className={bodyStyles}>
      {claimedRewards?.map((item) => (
        <ClaimedRewardsRow key={item?.content.identifier} data={item} />
      ))}
    </tbody>
  );
}
