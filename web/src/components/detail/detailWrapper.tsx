"use client";
import {
  CampaignDetail,
  PriceEvent,
  PricePoint,
  SimpleCampaignDetail,
} from "@/types";
import DetailHeader from "./detailHeader";
import DetailOutcomeTable from "./detailOutcomeTable";
import DetailCall2Action from "./detailAction";
import { SelectedOutcome } from "../../types";
import { useState } from "react";
import useSharePrices from "@/hooks/useSharePrices";
import DetailInfo from "./detailInfo";
import { useSearchParams } from "next/navigation";
import AssetScene from "../user/assetScene";
import DetailResults from "./detailResults";
import { useQuery } from "@tanstack/react-query";
import { requestCampaignById } from "@/providers/graphqlClient";
import { useDegenStore } from "@/stores/degenStore";
import { combineClass } from "@/utils/combineClass";
import DetailComments from "./detailComments";
import PriceChart from "../charts/priceChart";
import { formatCampaignDetail } from "@/utils/format/formatCampaign";
import PriceChartWrapper from "../charts/assetPriceChartWrapper";

export default function DetailWrapper({
  initialData,
  priceEvents,
  pricePoints,
}: {
  initialData: CampaignDetail;
  pricePoints: PricePoint[];
  priceEvents: PriceEvent[];
}) {
  const outcomeId = useSearchParams()?.get("outcomeId");
  const { data } = useQuery({
    queryKey: ["campaign", initialData.identifier],
    queryFn: async () => {
      const res = (await requestCampaignById(initialData.identifier))!;
      const campaign = formatCampaignDetail(res);
      return campaign;
    },
    initialData,
  });
  const [selectedOutcome, setSelectedOutcome] = useState<SelectedOutcome>({
    id:
      data.outcomes.find((o) => o.identifier === outcomeId)?.identifier ??
      data.outcomes[0].identifier,
    state: "buy",
  });
  const outcomeIds = data.outcomes.map((o) => o.identifier as `0x${string}`);
  const { data: sharePrices } = useSharePrices({
    tradingAddr: data.poolAddress as `0x${string}`,
    outcomeIds,
  });
  const isEnded = data.ending < Date.now();
  const notStarted = data.starting > Date.now();
  const isConcluded = Boolean(data.winner);
  const isDegenModeEnabled = useDegenStore((s) => s.degenModeEnabled);
  return (
    <section
      className={combineClass(
        isDegenModeEnabled ? "xl:flex-row xl:gap-4" : "md:flex-row md:gap-4",
        "flex h-full flex-col gap-8",
      )}
    >
      <div className="flex flex-[2] flex-col gap-8">
        <DetailHeader
          pointsData={pricePoints}
          data={data}
          notStarted={notStarted}
          isEnded={isEnded}
          isConcluded={isConcluded}
        />
        {data.isDppm && data.priceMetadata ? (
          <PriceChartWrapper
            campaignData={data as SimpleCampaignDetail}
            pointsData={pricePoints}
            simple={false}
          />
        ) : (
          <PriceChart
            poolAddress={data.poolAddress}
            outcomes={data.outcomes}
            initialData={priceEvents}
          />
        )}
        <DetailOutcomeTable
          data={data}
          isDpm={data.isDpm}
          sharePrices={sharePrices}
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
          isConcluded={isConcluded}
        />
        <DetailInfo data={data} />
        <DetailComments
          campaignId={data.identifier}
          creator={data.creator.address}
          outcomes={data.outcomes}
        />
      </div>
      <div className="flex flex-1 flex-col gap-8">
        {isConcluded ? (
          <DetailResults data={data} />
        ) : (
          <DetailCall2Action
            isDppm={data.isDppm}
            isDpm={data.isDpm}
            shouldStopAction={isEnded || isConcluded || notStarted}
            selectedOutcome={selectedOutcome}
            setSelectedOutcome={setSelectedOutcome}
            data={data}
            price={
              sharePrices?.find((item) => item.id === selectedOutcome.id)
                ?.price ?? "0"
            }
          />
        )}
        <AssetScene campaignDetail={data} />
      </div>
    </section>
  );
}
