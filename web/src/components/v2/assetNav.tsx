"use client";
import config from "@/config";
import TabButton from "../tabButton";
import Link from "next/link";
import { RawAsset, SimpleMarketKey, SimpleMarketPeriod } from "@/types";
import isMarketOpen from "../../utils/isMarketOpen";
import useAssets from "@/hooks/useAssets";
import GroupButton, { GroupButtonProps } from "./groupButton";
import { useRouter } from "next/navigation";

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
    <Link href={`/simple/campaign/${market.slug}/${period}`} className="flex">
      <TabButton
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
      callback: () => router.push(`/campaign/${mins5Markets[0]}/5mins`),
    },
    {
      title: is15Min ? "15 Min Markets" : "15 Mins",
      callback: () => router.push(`/campaign/${mins15Markets[0]}/15mins`),
    },
    {
      title: isHourly ? "Hourly Markets" : "Hourly",
      callback: () => router.push(`/campaign/${hourlyMarkets[0]}/hourly`),
    },
  ] as GroupButtonProps[];
  const order = periodOrder.findIndex((p) => p === period.toLowerCase());
  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full gap-2">
        <GroupButton
          buttons={buttons}
          className="w-full"
          initialIdx={order === -1 ? 0 : order}
        />
      </div>
      <div className="flex items-center overflow-x-auto border-b border-b-9black">
        {Object.values(config.simpleMarkets)
          .filter(
            (m) =>
              m.periods.includes(period.toLowerCase() as SimpleMarketPeriod) &&
              m.listed,
          )
          .sort((a, b) => {
            const aSpent =
              assets?.find(
                (as) => as.name.toLowerCase() === a.slug.toLowerCase(),
              )?.totalSpent ?? 0;
            const bSpent =
              assets?.find(
                (as) => as.name.toLowerCase() === b.slug.toLocaleLowerCase(),
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
  );
}
