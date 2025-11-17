import { HeaderBox } from "../detail/detailHeaderBox";
import { PricePoint, SimpleCampaignDetail } from "@/types";
import DetailCurrentPriceBox from "../detail/detailCurrentPriceBox";

export default async function SimpleSubHeader({
  campaignData,
  pointsData,
}: {
  campaignData: SimpleCampaignDetail;
  pointsData: PricePoint[];
}) {
  const isEnded = Date.now() > campaignData.ending;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <HeaderBox
        title="Base Price"
        value={`$${campaignData.priceMetadata.priceTargetForUp}`}
      />
      <DetailCurrentPriceBox
        isEnded={isEnded}
        symbol={campaignData.priceMetadata.baseAsset}
        ending={campaignData.ending}
        starting={campaignData.starting}
        initialData={pointsData}
      />
    </div>
  );
}
