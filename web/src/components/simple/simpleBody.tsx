"use client";
import { PricePoint, SimpleCampaignDetail } from "@/types";
import SimpleSubHeader from "./simpleSubHeader";
import SimpleButtons from "./simpleButtons";
import SimpleChance from "./simpleChance";
import SimplePositions from "./simplePositions";
import SimpleModeAlert from "./simpleModeAlert";
import { useQuery } from "@tanstack/react-query";
import PriceChartWrapper from "../charts/priceChartWrapper";

export default function SimpleBody({
  campaignData,
  pointsData,
}: {
  campaignData: SimpleCampaignDetail;
  pointsData: PricePoint[];
}) {
  const { data } = useQuery<SimpleCampaignDetail>({
    queryKey: ["simpleCampaign", campaignData.identifier],
    initialData: campaignData,
  });
  return (
    <>
      <SimpleModeAlert />
      <SimpleSubHeader campaignData={data} pointsData={pointsData} />
      <PriceChartWrapper simple campaignData={data} pointsData={pointsData} />
      <SimpleButtons data={data} />
      <SimpleChance data={data} />
      <SimplePositions data={data} />
    </>
  );
}
