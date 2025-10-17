import AssetPriceChart from "@/components/assetPriceChart";
import config from "@/config";
import { requestSimpleMarket } from "@/providers/graphqlClient";
import Image from "next/image";
import { notFound } from "next/navigation";
import BTC from "#/images/tokens/btc.webp";
type Params = Promise<{ id: string }>;
export async function generateStaticParams() {
  return config.simpleMarkets.map((id) => ({
    id,
  }));
}
export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const response = await requestSimpleMarket(id);
  return {
    title: response?.name ?? "Predict on 9LIVES.so",
    description: response?.description,
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
  if (!data) notFound();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Image src={BTC} width={60} height={60} alt={data.name} />
        <div className="flex flex-col gap-1">
          <h1 className="font-chicago text-xl md:text-2xl">{data.name}</h1>
          <span className="font-geneva text-xs uppercase text-[#808080]">
            {new Date(data.starting).toLocaleString("default", {
              hour: "numeric",
            })}{" "}
            -{" "}
            {new Date(data.ending).toLocaleString("default", {
              hour: "numeric",
            })}
          </span>
        </div>
      </div>
      <AssetPriceChart
        simple
        basePrice={data.basePrice}
        id={data.identifier}
        symbol={data.symbol}
        starting={data.starting}
        ending={data.ending}
      />
    </div>
  );
}
