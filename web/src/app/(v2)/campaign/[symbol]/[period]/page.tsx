import config from "@/config";
import { requestAssets, requestSimpleMarket } from "@/providers/graphqlClient";
import { notFound } from "next/navigation";
import SimpleBody from "@/components/v2/body";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import { SimpleMarketKey, SimpleMarketPeriod } from "@/types";
import AssetNav from "@/components/v2/assetNav";
import NavContextProvider from "@/providers/navContext";

type Params = Promise<{ symbol: string; period: string }>;
export const dynamicParams = true;
export const revalidate = 300;

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
  return {
    title: `${symbol.toUpperCase()} Price Prediction (${period}) | On-Chain Crypto Market`,
    description: `Live on-chain ${symbol.toUpperCase()} price prediction for ${period} markets. See real-time odds, market sentiment, and whether ${symbol.toUpperCase()} will go up or down.`,
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
  const [data, assets] = await Promise.all([
    requestSimpleMarket(symbol, period),
    requestAssets(),
  ]);
  if (!data) notFound();

  const campaignData = formatSimpleCampaignDetail(data);

  if (!isSimpleMarketKey(symbol)) notFound();
  if (!isSimpleMarketPeriod(period)) notFound();
  if (!isSimpleMarketListed(symbol)) notFound();

  return (
    <div className="flex flex-col gap-4">
      <NavContextProvider initialSymbol={symbol} initialPeriod={period}>
        <AssetNav assets={assets} />
        <SimpleBody initialAssets={assets} campaignData={campaignData} />
      </NavContextProvider>
    </div>
  );
}
