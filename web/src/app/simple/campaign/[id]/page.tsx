import AssetPriceChart from "@/components/assetPriceChart";
import config from "@/config";
import { requestSimpleMarket } from "@/providers/graphqlClient";
import { notFound } from "next/navigation";
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
    <div>
      <h2>{data.name}</h2>
      <div className="flex items-center justify-between">
        <span>{data.basePrice}</span>
        <span>
          {new Date(data.ending).toLocaleString("default", { hour: "2-digit" })}
        </span>
      </div>
      <AssetPriceChart
        basePrice={data.basePrice}
        id={data.identifier}
        symbol={data.symbol}
        starting={data.starting}
        ending={data.ending}
      />
    </div>
  );
}
