import { HeaderBox } from "../detail/detailHeaderBox";
import { SimpleCampaignDetail } from "@/types";
import getAndFormatAssetPrices from "@/utils/getAndFormatAssetPrices";
import DetailCurrentPriceBox from "../detail/detailCurrentPriceBox";

export const dynamicParams = true;
export const revalidate = 60;

export default async function SimpleSubHeader({
  data,
}: {
  data: SimpleCampaignDetail;
}) {
  const isEnded = Date.now() > data.ending;
  const pointsData = await getAndFormatAssetPrices({
    symbol: data.priceMetadata!.baseAsset,
    starting: data.starting,
    ending: data.ending,
  });

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <HeaderBox
        title="Base Price"
        value={`$${data.priceMetadata.priceTargetForUp}`}
      />
      <DetailCurrentPriceBox
        isEnded={isEnded}
        symbol={data.priceMetadata.baseAsset}
        ending={data.ending}
        starting={data.starting}
        initialData={pointsData}
      />
    </div>
  );
}
