"use client";
import { SimpleCampaignDetail } from "@/types";
import Button from "./button";
import React, { useEffect } from "react";
import useCountdown from "@/hooks/useCountdown";
import isMarketOpen from "@/utils/isMarketOpen";
import config from "@/config";
import MobileMenuButton from "./mobileMenuButton";
import Badge from "./chanceBadge";

export default function SimpleButtons({
  data,
  setIsBuyDialogOpen,
  setOutcomeIdx,
  yes,
  no,
}: {
  data: SimpleCampaignDetail;
  setIsBuyDialogOpen: React.Dispatch<boolean>;
  setOutcomeIdx: React.Dispatch<number>;
  yes: string;
  no: string;
}) {
  const timeleft = useCountdown(data.ending, "differenceInMs");
  const isEnded = 60 * 1000 >= Number(timeleft); // Prevent last minute buy
  const isOpen = isMarketOpen(
    config.simpleMarkets[data.priceMetadata.baseAsset],
  );
  useEffect(() => {
    if (isEnded) {
      setIsBuyDialogOpen(false);
    }
  }, [isEnded]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-auto flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          title="Yes"
          intent={"yes"}
          size={"large"}
          disabled={isEnded || !isOpen}
          className={"flex-1"}
          onClick={() => {
            setOutcomeIdx(1);
            setIsBuyDialogOpen(true);
          }}
          badge={<Badge intent={"yes"} chance={yes} />}
        />
        <Button
          title="No"
          intent={"no"}
          size={"large"}
          disabled={isEnded || !isOpen}
          className={"flex-1"}
          onClick={() => {
            setOutcomeIdx(0);
            setIsBuyDialogOpen(true);
          }}
          badge={<Badge intent={"no"} chance={no} />}
        />
        <MobileMenuButton />
      </div>
      {isEnded ? (
        <p className="text-center text-xs text-neutral-400">
          Last minute buy is not allowed.
        </p>
      ) : null}
    </div>
  );
}
