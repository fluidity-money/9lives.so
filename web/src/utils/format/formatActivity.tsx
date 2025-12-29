import { Activity, RawActivity } from "@/types";
import { formatDppmOutcomeName, formatDppmTitle } from "./formatDppmName";
import { formatPriceMetadata } from "./formatCampaign";

export default function formatActivity(ro: RawActivity): Activity {
  if (!ro) throw new Error();
  if (ro.campaignContent.priceMetadata && ro.campaignContent.isDppm) {
    const priceMetadata = formatPriceMetadata(ro.campaignContent.priceMetadata);
    if (!priceMetadata) throw new Error("No price metadata for dppm");
    return {
      ...ro,
      campaignName: formatDppmTitle({
        symbol: priceMetadata.baseAsset,
        price: priceMetadata.priceTargetForUp,
        end: ro.campaignContent.ending * 1000,
      }),
      outcomeName: formatDppmOutcomeName(ro.outcomeName),
    };
  }
  return ro;
}
