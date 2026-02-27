"use client";
import config from "@/config";
import Link from "next/link";
import {
  GroupButtonProps,
  RawAsset,
  SimpleMarketKey,
  SimpleMarketPeriod,
} from "@/types";
import isMarketOpen from "../../utils/isMarketOpen";
import useAssets from "@/hooks/useAssets";
import GroupButton from "./groupButton";
import { useRouter } from "next/navigation";
import AssetButton from "./assetButton";
import GroupButtonMobile from "./groupButtonMobile";
import { NavContext } from "@/providers/navContext";
import { useContext } from "react";
import useAssetsHourlyDelta from "@/hooks/useAssetsHourlyDelta";

function SimpleTabMenuButton({
  market,
  symbol,
  period,
  isPriceUp,
}: {
  market: (typeof config.simpleMarkets)[keyof typeof config.simpleMarkets];
  symbol: SimpleMarketKey;
  period: SimpleMarketPeriod;
  isPriceUp?: boolean;
}) {
  const isOpen = isMarketOpen(market);
  return (
    <Link href={`/campaign/${market.slug}/${period}`} className="flex">
      <AssetButton
        period={period}
        isLive={isOpen}
        isPriceUp={isPriceUp}
        title={market.tabTitle}
        selected={symbol === market.slug}
      />
    </Link>
  );
}

export default function AssetNav({
  assets: initialAssets,
}: {
  assets: RawAsset[];
}) {
  const { period, symbol } = useContext(NavContext);
  const { data: assets } = useAssets(initialAssets);
  const router = useRouter();
  const mins5Markets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("5mins") && i.listed)
    .map((i) => i.slug);
  const mins15Markets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("15mins") && i.listed)
    .map((i) => i.slug);
  const hourlyMarkets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("hourly") && i.listed)
    .map((i) => i.slug);
  const is5Min = period.toLowerCase() === "5mins";
  const is15Min = period.toLowerCase() === "15mins";
  const isHourly = period.toLowerCase() === "hourly";
  const periodOrder = ["15mins", "5mins", "hourly"];
  const buttons = [
    {
      title: is15Min ? "15 Min Markets" : "15 Mins",
      mobileTitle: "15 Min",
      callback: () => router.push(`/campaign/${mins15Markets[0]}/15mins`),
    },
    {
      title: is5Min ? "5 Min Markets" : "5 Mins",
      mobileTitle: "5 Min",
      callback: () => router.push(`/campaign/${mins5Markets[0]}/5mins`),
    },
    {
      title: isHourly ? "Hourly Markets" : "Hourly",
      mobileTitle: "1 Hr",
      callback: () => router.push(`/campaign/${hourlyMarkets[0]}/hourly`),
    },
  ] as GroupButtonProps[];
  const orderIdx = periodOrder.findIndex((p) => p === period.toLowerCase());
  const { data } = useAssetsHourlyDelta();

  return (
    <div className="flex flex-row gap-2 md:flex-col md:gap-4">
      <GroupButton
        buttons={buttons}
        className="hidden md:flex"
        initialIdx={orderIdx}
        initialDelay={0}
      />
      <GroupButtonMobile
        buttons={buttons}
        className="md:hidden"
        initialIdx={orderIdx}
        initialDelay={0}
      />
      <div className="relative h-[37px] w-full grow md:h-[38px]">
        <div className="absolute inset-0 overflow-x-auto">
          <div className="flex items-center gap-0.5 md:gap-1">
            {Object.values(config.simpleMarkets)
              .filter(
                (m) =>
                  m.periods.includes(
                    period.toLowerCase() as SimpleMarketPeriod,
                  ) && m.listed,
              )
              .sort((a, b) => {
                const aSpent =
                  assets?.find(
                    (as) => as.name.toLowerCase() === a.slug.toLowerCase(),
                  )?.totalSpent ?? 0;
                const bSpent =
                  assets?.find(
                    (as) =>
                      as.name.toLowerCase() === b.slug.toLocaleLowerCase(),
                  )?.totalSpent ?? 0;
                return bSpent - aSpent;
              })
              .map((m) => {
                const asset = data?.find(
                  (i) => i.name.toLowerCase() === symbol,
                );
                const isPriceUp =
                  asset && Number(asset.price) >= Number(asset.hourAgoPrice);
                return (
                  <SimpleTabMenuButton
                    key={m.slug}
                    market={m}
                    isPriceUp={isPriceUp}
                    symbol={symbol}
                    period={period}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
