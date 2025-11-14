import {
  requestCampaignById,
  requestSimpleMarket,
} from "@/providers/graphqlClient";
import { RawCampaignDetail, RawSimpleCampaignDetail } from "@/types";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import { notFound } from "next/navigation";
import CountdownTimer from "../countdownTimer";

export const dynamicParams = true;
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function SimpleHeader({
  cid,
  id,
}: {
  cid?: string;
  id: string;
}) {
  let res: RawSimpleCampaignDetail | RawCampaignDetail;
  if (cid) {
    res = await requestCampaignById(cid, {
      next: { revalidate: 0 },
      cache: "no-store",
    });
  } else {
    res = await requestSimpleMarket(id, {
      next: { revalidate: 0 },
      cache: "no-store",
    });
  }
  if (!res || !res.priceMetadata) notFound();
  const data = formatSimpleCampaignDetail(res);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-chicago text-xl md:text-2xl">{data.name}</h1>
      <div className="flex items-center gap-1 text-xs">
        <span className="font-geneva uppercase text-[#808080]">
          {new Date(data.starting).toLocaleString("default", {
            hour: "numeric",
            timeZone: "UTC",
          })}{" "}
          -{" "}
          {new Date(data.ending).toLocaleString("default", {
            hour: "numeric",
            timeZone: "UTC",
          })}
          {" UTC"}
        </span>
        <CountdownTimer endTime={data.ending} />
      </div>
    </div>
  );
}
