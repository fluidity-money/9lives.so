import { HeaderBox } from "../detail/detailHeaderBox";
import { SimpleCampaignDetail } from "@/types";
import DetailCurrentPriceBox from "../detail/detailCurrentPriceBox";

export default function SimpleSubHeader({
  campaignData,
}: {
  campaignData: SimpleCampaignDetail;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <HeaderBox
        title="Base Price"
        value={`$${campaignData.priceMetadata.priceTargetForUp}`}
      />
      <DetailCurrentPriceBox
        symbol={campaignData.priceMetadata.baseAsset}
        ending={campaignData.ending}
        starting={campaignData.starting}
        isEnded={false}
      />
    </div>
  );
}
