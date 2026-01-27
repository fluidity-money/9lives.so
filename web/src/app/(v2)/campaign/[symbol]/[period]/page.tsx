import config from "@/config";
import { requestAssets, requestSimpleMarket } from "@/providers/graphqlClient";
import { notFound } from "next/navigation";
import SimpleBody from "@/components/v2/body";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import { SimpleMarketKey, SimpleMarketPeriod } from "@/types";
import AssetNav from "@/components/v2/assetNav";

type Params = Promise<{ symbol: string; period: string }>;
export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  return Object.values(config.simpleMarkets).reduce(
    (acc, v) => {
      if (v.listed) {
        for (const period of v.periods) {
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
        imageUrl: `${config.metadata.metadataBase.origin}/campaign/${symbol}/${period}/farcaster-image`,
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

  const assets = await requestAssets();

  if (!isSimpleMarketKey(symbol)) notFound();
  if (!isSimpleMarketPeriod(period)) notFound();
  if (!isSimpleMarketListed(symbol)) notFound();

  return (
    <div className="flex flex-col gap-4">
      <AssetNav symbol={symbol} period={period} assets={assets} />
      <SimpleBody symbol={symbol} campaignData={campaignData} />
    </div>
  );
}
