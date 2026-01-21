"use client";
import { SimpleCampaignDetail } from "@/types";
import Button from "./button";
import React from "react";
import useCountdown from "@/hooks/useCountdown";
import isMarketOpen from "@/utils/isMarketOpen";
import config from "@/config";

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
  const isOpen = isMarketOpen(
    config.simpleMarkets[data.priceMetadata.baseAsset],
  );
  if (isEnded || !isOpen) return null;

  return (
    <div className="flex flex-auto items-center gap-2">
      <Button
        title="Yes"
        intent={"yes"}
        size={"large"}
        className={"flex-1"}
        onClick={() => {
          setOutcomeIdx(1);
          setIsBuyDialogOpen(true);
        }}
      />
      <Button
        title="No"
        intent={"no"}
        size={"large"}
        className={"flex-1"}
        onClick={() => {
          setOutcomeIdx(0);
          setIsBuyDialogOpen(true);
        }}
      />
    </div>
  );
}
