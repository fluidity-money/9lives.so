"use client";
import { SimpleCampaignDetail } from "@/types";
import Button from "./button";
import React, { useEffect } from "react";
import useCountdown from "@/hooks/useCountdown";
import isMarketOpen from "@/utils/isMarketOpen";
import config from "@/config";
import MobileMenuButton from "./mobileMenuButton";
import Badge from "./chanceBadge";
import { useNightMode } from "@/providers/nightMode";

const SunIcon = () => (
  <svg
    aria-hidden="true"
    className="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    aria-hidden="true"
    className="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

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
  const { isNightMode, toggleNightMode } = useNightMode();
  useEffect(() => {
    if (isEnded) {
      setIsBuyDialogOpen(false);
    }
  }, [isEnded, setIsBuyDialogOpen]);

  return (
    <div className="flex flex-auto flex-col gap-2">
      <div className="flex items-center gap-2">
        {isOpen ? (
          <>
            <Button
              title="Yes"
              intent={"yes"}
              size={"large"}
              disabled={isEnded}
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
              disabled={isEnded}
              className={"flex-1"}
              onClick={() => {
                setOutcomeIdx(0);
                setIsBuyDialogOpen(true);
              }}
              badge={<Badge intent={"no"} chance={no} />}
            />
          </>
        ) : null}
        <Button
          intent="inverted"
          size="large"
          title={isNightMode ? "Disable night mode" : "Enable night mode"}
          aria-label={isNightMode ? "Disable night mode" : "Enable night mode"}
          onClick={toggleNightMode}
          className="shrink-0 px-4"
        >
          {isNightMode ? <SunIcon /> : <MoonIcon />}
        </Button>
        <MobileMenuButton />
      </div>
      {isOpen && isEnded ? (
        <p className="text-center text-xs text-neutral-400">
          Last minute buy is not allowed.
        </p>
      ) : null}
    </div>
  );
}
