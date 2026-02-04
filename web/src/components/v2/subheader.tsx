import { HeaderBox } from "./headerBox";
import { SimpleCampaignDetail } from "@/types";
import DetailCurrentPriceBox from "./currentPriceBox";
import dynamic from "next/dynamic";
const CountdownTimer = dynamic(() => import("./countdown"), { ssr: false });
export default function SimpleSubHeader({
  campaignData,
}: {
  campaignData: SimpleCampaignDetail;
}) {
  return (
    <div className="flex flex-col flex-wrap items-end gap-0.5 md:flex-row md:gap-2.5">
      <CountdownTimer endTime={campaignData.ending} />
      <HeaderBox
        title="Base"
        value={`$${Number(campaignData.priceMetadata.priceTargetForUp).toFixed(2)}`}
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
