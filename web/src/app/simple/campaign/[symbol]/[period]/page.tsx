import config from "@/config";
import { requestAssets, requestSimpleMarket } from "@/providers/graphqlClient";
import Image from "next/image";
import { notFound } from "next/navigation";
import SimpleNavMenu from "@/components/simple/simpleNavMenu";
import SimpleBody from "@/components/simple/simpleBody";
import { Suspense } from "react";
import SimpleHeader from "@/components/simple/simpleHeader";
import getAndFormatAssetPrices from "@/utils/getAndFormatAssetPrices";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import { SimpleMarketKey, SimpleMarketPeriod } from "@/types";

type Params = Promise<{ symbol: string; period: string }>;
export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  return Object.values(config.simpleMarkets).reduce(
    (acc, v) => {
      if (v.listed) {
        for (let period of v.periods) {
          acc.push({
            symbol: v.slug,
            period,
          });
        }
      }
      return acc;
    },
    [] as { symbol: string; period: string }[],
  );
}
export async function generateMetadata({ params }: { params: Params }) {
  const { symbol, period } = await params;
  const response = await requestSimpleMarket(symbol, period);
  const data = formatSimpleCampaignDetail(response);
  return {
    title: data.name ?? "Predict asset prices on 9lives.so",
    description: `Predict ${symbol.toUpperCase()} prices in ${period} markets.`,
    other: {
      "fc:miniapp": JSON.stringify({
        version: config.frame.version,
        imageUrl: `${config.metadata.metadataBase.origin}/simple/campaign/${symbol}/${period}/farcaster-image`,
        button: config.frame.button,
      }),
    },
  };
}
function isSimpleMarketKey(k: string): k is SimpleMarketKey {
  return k.toLowerCase() in config.simpleMarkets;
}
function isSimpleMarketPeriod(p: string): p is SimpleMarketPeriod {
  return (
    p.toLowerCase() === "hourly" ||
    p.toLowerCase() === "15mins" ||
    p.toLowerCase() === "5mins"
  );
}
function isSimpleMarketListed(k: SimpleMarketKey): boolean {
  return config.simpleMarkets[k.toLowerCase() as SimpleMarketKey].listed;
}
export default async function SimpleDetailPage({ params }: { params: Params }) {
  const { symbol, period } = await params;

  const data = await requestSimpleMarket(symbol, period);
  if (!data) notFound();

  const campaignData = formatSimpleCampaignDetail(data);

  const pointsData = await getAndFormatAssetPrices({
    symbol: campaignData.priceMetadata!.baseAsset,
    starting: campaignData.starting,
    ending: campaignData.ending,
  });

  const assets = await requestAssets();

  if (!isSimpleMarketKey(symbol)) notFound();
  if (!isSimpleMarketPeriod(period)) notFound();
  if (!isSimpleMarketListed(symbol)) notFound();

  return (
    <div className="flex flex-col gap-4">
      <SimpleNavMenu symbol={symbol} period={period} assets={assets} />
      <div className="flex items-center gap-2">
        <Image
          src={config.simpleMarkets[symbol].logo}
          width={60}
          height={60}
          alt={symbol}
        />
        <Suspense
          fallback={
            <div>
              <h1 className="font-chicago text-xl md:text-2xl">
                {config.simpleMarkets[symbol].title} above $...... on{" "}
                {new Date().toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  hourCycle: "h23",
                  minute: "2-digit",
                  timeZone: "UTC",
                })}{" "}
                UTC
              </h1>
              <span className="font-geneva text-xs uppercase text-[#808080]">
                {new Date().toLocaleString("default", {
                  hour: "numeric",
                  timeZone: "UTC",
                })}{" "}
                -{" "}
                {new Date(Date.now() + 1000 * 60 * 60).toLocaleString(
                  "default",
                  {
                    hour: "numeric",
                    timeZone: "UTC",
                  },
                )}
                {" UTC"}
              </span>
            </div>
          }
        >
          <SimpleHeader initialData={campaignData} />
        </Suspense>
      </div>
      <SimpleBody pointsData={pointsData} campaignData={campaignData} />
    </div>
  );
}
