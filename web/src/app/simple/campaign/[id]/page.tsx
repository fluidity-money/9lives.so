import config from "@/config";
import { requestSimpleMarket } from "@/providers/graphqlClient";
import Image from "next/image";
import { notFound } from "next/navigation";
import SimpleNavMenu from "@/components/simple/simpleNavMenu";
import SimpleBody from "@/components/simple/simpleBody";
import { Suspense } from "react";
import SimpleHeader from "@/components/simple/simpleHeader";
import getAndFormatAssetPrices from "@/utils/getAndFormatAssetPrices";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";

type Params = Promise<{ id: string }>;
export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  return Object.values(config.simpleMarkets).map((m) => ({
    id: m.slug,
  }));
}
export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestSimpleMarket(id);
  return {
    title: response?.name ?? "Predict on 9lives.so",
    description: response?.name ?? "Predict token prices in hourly markets",
    other: {
      "fc:miniapp": JSON.stringify({
        version: config.frame.version,
        imageUrl: `${config.metadata.metadataBase.origin}/simple/campaign/${id}/farcaster-image`,
        button: config.frame.button,
      }),
    },
  };
}
function isSimpleMarketKey(k: string): k is keyof typeof config.simpleMarkets {
  return k in config.simpleMarkets;
}
export default async function SimpleDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const data = await requestSimpleMarket(id);
  if (!data) notFound();

  const campaignData = formatSimpleCampaignDetail(data);

  const pointsData = await getAndFormatAssetPrices({
    symbol: campaignData.priceMetadata!.baseAsset,
    starting: campaignData.starting,
    ending: campaignData.ending,
  });

  if (!isSimpleMarketKey(id)) notFound();

  return (
    <div className="flex flex-col gap-4">
      <SimpleNavMenu />
      <div className="flex items-center gap-2">
        <Image
          src={config.simpleMarkets[id].logo}
          width={60}
          height={60}
          alt={id}
        />
        <Suspense
          fallback={
            <div>
              <h1 className="font-chicago text-xl md:text-2xl">
                {config.simpleMarkets[id].title} above $...... on{" "}
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
