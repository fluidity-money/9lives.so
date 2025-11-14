import { SimpleCampaignDetail } from "@/types";
import SimpleChart from "./simpleChart";
import getAndFormatAssetPrices from "@/utils/getAndFormatAssetPrices";

export const dynamicParams = true;
export const revalidate = 300;
export default async function SimpleChartServer({
  data,
  simple,
}: {
  data: SimpleCampaignDetail;
  simple: boolean;
}) {
  const pointsData = await getAndFormatAssetPrices({
    symbol: data.priceMetadata!.baseAsset,
    starting: data.starting,
    ending: data.ending,
  });

  return (
    <SimpleChart pointsData={pointsData} campaignData={data} simple={simple} />
  );
}
