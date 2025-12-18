"use client";
import config from "@/config";
import TabButton from "../tabButton";
import Link from "next/link";
import { SimpleMarketKey, SimpleMarketPeriod } from "@/types";
import isMarketOpen from "../../utils/isMarketOpen";
import TabRadioButton from "../tabRadioButton";

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

export default function SimpleNavMenu({
  symbol,
  period,
}: {
  symbol: SimpleMarketKey;
  period: SimpleMarketPeriod;
}) {
  const mins15Markets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("15mins"))
    .map((i) => i.slug);
  const hourlyMarkets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("hourly"))
    .map((i) => i.slug);
  // const dailyMarkets = Object.values(config.simpleMarkets)
  //   .filter((i) => i.periods.includes("daily"))
  //   .map((i) => i.slug);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full gap-2">
        <Link
          href={`/simple/campaign/${mins15Markets[0]}/15mins`}
          className="flex flex-1"
        >
          <TabRadioButton
            selected={period.toLowerCase() === "15mins"}
            title="15 Min Markets"
          />
        </Link>
        <Link
          href={`/simple/campaign/${hourlyMarkets[0]}/hourly`}
          className="flex flex-1"
        >
          <TabRadioButton
            selected={period.toLowerCase() === "hourly"}
            title="Hourly Markets"
          />
        </Link>
        {/* <Link
          href={`/simple/campaign/${dailyMarkets[0]}/daily`}
          className="flex flex-1"
        >
          <TabRadioButton
            selected={period.toLowerCase() === "daily"}
            title="Daily"
          />
        </Link> */}
      </div>
      <div className="flex items-center overflow-x-auto border-b border-b-9black">
        {Object.values(config.simpleMarkets)
          .filter((m) =>
            m.periods.includes(period.toLowerCase() as SimpleMarketPeriod),
          )
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
