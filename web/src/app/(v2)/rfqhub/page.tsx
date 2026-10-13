import RfqhubPrototype from "@/components/rfqhub/rfqhubPrototype";
import { requestSimpleMarket } from "@/providers/graphqlClient";
import { formatSimpleCampaignDetail } from "@/utils/format/formatCampaign";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Quick BTC prediction | 9lives",
  description: "Build a short-duration BTC price prediction with Rfqhub.",
};

export default async function RfqhubPage() {
  const data = await requestSimpleMarket("btc", "15mins");
  if (!data) notFound();

  return <RfqhubPrototype campaignData={formatSimpleCampaignDetail(data)} />;
}
