import { RawCampaignDetail, RawSimpleCampaignDetail } from "@/types";
import SimpleSubHeader from "./simpleSubHeader";
import SimpleChartServer from "./simpleChartServer";
import SimpleButtons from "./simpleButtons";
import SimpleChance from "./simpleChance";
import SimplePositions from "./simplePositions";
import SimpleModeAlert from "./simpleModeAlert";
import config from "@/config";
import {
  requestCampaignById,
  requestSimpleMarket,
} from "@/providers/graphqlClient";
import { notFound } from "next/navigation";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import { Suspense } from "react";

export const dynamicParams = true;
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function SimpleBody({
  id,
  cid,
}: {
  id: keyof typeof config.simpleMarkets;
  cid: string;
}) {
  let res: RawSimpleCampaignDetail | RawCampaignDetail;
  if (cid) {
    res = await requestCampaignById(cid);
  } else {
    res = await requestSimpleMarket(id);
  }
  if (!res || !res.priceMetadata) notFound();
  const data = formatSimpleCampaignDetail(res);

  return (
    <>
      <SimpleModeAlert />
      <Suspense
        fallback={
          <div className="flex items-center gap-2.5">
            <div className="skeleton h-[66px] flex-1" />
            <div className="skeleton h-[66px] flex-1" />
          </div>
        }
      >
        <SimpleSubHeader data={data} />
      </Suspense>
      <Suspense fallback={<div className="skeleton h-[300px] w-[568px]"></div>}>
        <SimpleChartServer simple data={data} />
      </Suspense>
      <SimpleButtons data={data} />
      <Suspense fallback={<div className="skeleton h-5 w-full" />}>
        <SimpleChance data={data} />
      </Suspense>
      <SimplePositions data={data} />
    </>
  );
}
