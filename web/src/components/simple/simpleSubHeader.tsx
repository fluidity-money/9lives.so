import { requestFinalPrice } from "@/providers/graphqlClient";
import { HeaderBox } from "../detail/detailHeaderBox";
import { SimpleCampaignDetail } from "@/types";
import { formatAssetPrices } from "@/utils/format/formatAssetPrice";

export const dynamicParams = true;
export const revalidate = 60;

export default async function SimpleSubHeader({
  data,
}: {
  data: SimpleCampaignDetail;
}) {
  const isEnded = Date.now() > data.ending;
  const response = await requestFinalPrice(
    data.priceMetadata.baseAsset,
    new Date(data.starting).toISOString(),
    new Date(data.ending).toISOString(),
  );
  const latestPrice = formatAssetPrices(response)[0];
  const subHeaderMap = [
    {
      title: "Base Price",
      value: `$${data.priceMetadata.priceTargetForUp}`,
      show: true,
    },
    {
      title: isEnded ? "Final Price" : "Current Price",
      value: `$${latestPrice.price}`,
      show: true,
    },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {subHeaderMap
        .filter((i) => i.show)
        .map((i) => (
          <HeaderBox key={i.title} title={i.title} value={i.value} />
        ))}
    </div>
  );
}
