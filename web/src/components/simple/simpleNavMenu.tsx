"use client";
import config from "@/config";
import TabButton from "../tabButton";
import Link from "next/link";
import { SimpleMarketKey, SimpleMarketPeriod } from "@/types";
import { combineClass } from "@/utils/combineClass";
import isMarketOpen from "../../utils/isMarketOpen";

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
    <Link href={`/simple/campaign/${market.slug}/${period}`}>
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
  const hourlyMarkets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("hourly"))
    .map((i) => i.slug);
  const dailyMarkets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("daily"))
    .map((i) => i.slug);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[36px] gap-1 self-start bg-[#ccc] p-2">
        <Link
          href={`/simple/campaign/${hourlyMarkets[0]}/hourly`}
          className={combineClass(
            "px-2 py-1",
            period === "hourly" && "border border-9black bg-white",
          )}
        >
          ⏱️ Hourly
        </Link>
        <Link
          href={`/simple/campaign/${dailyMarkets[0]}/daily`}
          className={combineClass(
            "px-2 py-1",
            period === "daily" && "border border-9black bg-white",
          )}
        >
          📆 Daily
        </Link>
      </div>
      <div className="flex items-center border-b border-b-9black">
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
