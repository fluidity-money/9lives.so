import config from "@/config";
import {
  requestAssetPrice,
  requestSimpleMarket,
} from "@/providers/graphqlClient";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import BTC from "#/images/tokens/btc.webp";
import SimpleNavMenu from "@/components/simple/simpleNavMenu";
import SimpleBody from "@/components/simple/simpleBody";
import CountdownTimer from "@/components/countdownTimer";
import { CampaignDetail, PricePoint } from "@/types";
import appConfig from "@/config";
type Params = Promise<{ id: string }>;
export const dynamicParams = true;
export const revalidate = 60;
export async function generateStaticParams() {
  return config.simpleMarkets.map((id) => ({
    id,
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
export default async function SimpleDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const data = await requestSimpleMarket(id);
  console.log("data", data);
  if (!data || !data.priceMetadata) notFound();

  let initialAssetPrices: PricePoint[] = [];
  const res = await requestAssetPrice(
    data.priceMetadata.baseAsset,
    new Date(data.starting * 1000).toISOString(),
    new Date(data.ending * 1000).toISOString(),
  );
  if (res && res.oracles_ninelives_prices_1) {
    initialAssetPrices = res.oracles_ninelives_prices_1.map((i) => ({
      price: i.amount,
      id: i.id,
      timestamp:
        new Date(i.created_by).getTime() -
        new Date().getTimezoneOffset() * 60 * 1000,
    }));
  }

  return (
    <div className="flex flex-col gap-4">
      <SimpleNavMenu />
      <div className="flex items-center gap-2">
        <Image src={BTC} width={60} height={60} alt={data.name} />
        <div className="flex flex-col gap-1">
          <h1 className="font-chicago text-xl md:text-2xl">{data.name}</h1>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-geneva uppercase text-[#808080]">
              {new Date(data.starting).toLocaleString("default", {
                hour: "numeric",
              })}{" "}
              -{" "}
              {new Date(data.ending).toLocaleString("default", {
                hour: "numeric",
              })}
            </span>
            <CountdownTimer endTime={data.ending} />
          </div>
        </div>
      </div>
      <SimpleBody
        data={{ ...data, priceMetadata: data.priceMetadata! }}
        initialAssetPrices={initialAssetPrices}
      />
    </div>
  );
}
