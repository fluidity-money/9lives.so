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

function SimpleTabMenuButton({
  market,
  period,
  symbol,
}: {
  market: (typeof config.simpleMarkets)[keyof typeof config.simpleMarkets];
  period: SimpleMarketPeriod;
  symbol: SimpleMarketKey;
}) {
  const isOpen = isMarketOpen(market);
  return (
    <Link href={`/campaign/${market.slug}/${period}`} className="flex">
      <AssetButton
        isLive={isOpen}
        title={market.tabTitle}
        selected={symbol === market.slug}
      />
    </Link>
  );
}

export default function AssetNav({
  symbol,
  period,
  assets: initialAssets,
}: {
  symbol: SimpleMarketKey;
  period: SimpleMarketPeriod;
  assets: RawAsset[];
}) {
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
  const periodOrder = ["5mins", "15mins", "hourly"];
  const buttons = [
    {
      title: is5Min ? "5 Min Markets" : "5 Mins",
      mobileTitle: "5 Min",
      callback: () => router.push(`/campaign/${mins5Markets[0]}/5mins`),
    },
    {
      title: is15Min ? "15 Min Markets" : "15 Mins",
      mobileTitle: "15 Min",
      callback: () => router.push(`/campaign/${mins15Markets[0]}/15mins`),
    },
    {
      title: isHourly ? "Hourly Markets" : "Hourly",
      mobileTitle: "1 Hr",
      callback: () => router.push(`/campaign/${hourlyMarkets[0]}/hourly`),
    },
  ] as GroupButtonProps[];
  const orderIdx = periodOrder.findIndex((p) => p === period.toLowerCase());
  return (
    <div className="flex flex-row gap-2 md:flex-col md:gap-4">
      <GroupButton
        buttons={buttons}
        className="hidden md:flex"
        initialIdx={orderIdx}
      />
      <GroupButtonMobile
        buttons={buttons}
        className="md:hidden"
        initialIdx={orderIdx}
      />
      <div className="-full relative h-[37px] grow md:h-[68px]">
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
              .map((m) => (
                <SimpleTabMenuButton
                  key={m.slug}
                  market={m}
                  symbol={symbol}
                  period={period}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
