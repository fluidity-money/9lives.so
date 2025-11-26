"use client";
import config from "@/config";
import TabButton from "../tabButton";
import Link from "next/link";
import { SimpleMarketKey, SimpleMarketPeriod } from "@/types";
import { Select } from "@headlessui/react";
import { useRouter } from "next/navigation";
export default function SimpleNavMenu({
  symbol,
  period,
}: {
  symbol: SimpleMarketKey;
  period: SimpleMarketPeriod;
}) {
  const router = useRouter();
  const hourlyMarkets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("hourly"))
    .map((i) => i.slug);
  const dailyMarkets = Object.values(config.simpleMarkets)
    .filter((i) => i.periods.includes("daily"))
    .map((i) => i.slug);

  return (
    <div className="flex flex-col gap-4">
      <Select
        name="order-by"
        aria-label="order-by"
        onChange={(e) =>
          router.push(
            `/simple/campaign/${e.target.value === "hourly" ? hourlyMarkets[0] : dailyMarkets[0]}/${e.target.value}`,
          )
        }
        value={period}
        className="flex min-h-[36px] items-center self-start rounded-sm border border-9black px-2 py-1 font-chicago text-xs shadow-9btnSecondaryIdle focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
      >
        <option value={"hourly"}>⏱️ Hourly</option>
        <option value={"daily"}>📆 Daily</option>
      </Select>
      <div className="flex items-center border-b border-b-9black">
        {Object.values(config.simpleMarkets)
          .filter((m) =>
            m.periods.includes(period.toLowerCase() as SimpleMarketPeriod),
          )
          .map((m) => (
            <Link key={m.slug} href={`/simple/campaign/${m.slug}/${period}`}>
              <TabButton title={m.tabTitle} selected={symbol === m.slug} />
            </Link>
          ))}
      </div>
    </div>
  );
}
