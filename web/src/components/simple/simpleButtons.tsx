"use client";
import { Outcome, SimpleCampaignDetail } from "@/types";
import Button from "../themed/button";
import useDppmRewards from "@/hooks/useDppmRewards";
import { useActiveAccount } from "thirdweb/react";
import SimpleClaimButton from "./simpleClaimButton";
import React from "react";
import useCountdown from "@/hooks/useCountdown";

export default function SimpleButtons({
  data,
  setIsBuyDialogOpen,
  setOutcomeIdx,
}: {
  data: SimpleCampaignDetail;
  setIsBuyDialogOpen: React.Dispatch<boolean>;
  setOutcomeIdx: React.Dispatch<number>;
}) {
  const timeleft = useCountdown(data.ending, "differenceInMs");
  const isEnded = 0 >= Number(timeleft);
  const account = useActiveAccount();
  const { totalRewards } = useDppmRewards({
    tradingAddr: data.poolAddress,
    account,
    priceMetadata: data.priceMetadata,
    starting: data.starting,
    ending: data.ending,
    outcomes: data.outcomes,
  });
  const winnerOutcome = data.outcomes.find(
    (o) => o.identifier === data?.winner,
  ) as Outcome;
  return (
    <>
      {isEnded ? (
        !!winnerOutcome && totalRewards > 0 ? (
          <SimpleClaimButton
            totalRewards={totalRewards}
            tradingAddr={data.poolAddress}
            outcomes={data.outcomes}
          />
        ) : null
      ) : (
        <div className="flex flex-auto items-center gap-2">
          <Button
            title="UP"
            intent={"yes"}
            size={"xlarge"}
            className={"flex-auto"}
            onClick={() => {
              setOutcomeIdx(1);
              setIsBuyDialogOpen(true);
            }}
          />
          <Button
            title="DOWN"
            intent={"no"}
            size={"xlarge"}
            className={"flex-auto"}
            onClick={() => {
              setOutcomeIdx(0);
              setIsBuyDialogOpen(true);
            }}
          />
        </div>
      )}
    </>
  );
}
