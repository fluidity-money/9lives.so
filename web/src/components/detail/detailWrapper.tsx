"use client";
import { CampaignDetail, PriceEvent, SimpleCampaignDetail } from "@/types";
import DetailHeader from "./detailHeader";
import DetailOutcomeTable from "./detailOutcomeTable";
import DetailCall2Action from "./detailAction";
import { SelectedOutcome } from "../../types";
import { useState } from "react";
import DetailInfo from "./detailInfo";
import { useSearchParams } from "next/navigation";
import AssetScene from "../user/assetScene";
import DetailResults from "./detailResults";
import { useQuery } from "@tanstack/react-query";
import { requestCampaignById } from "@/providers/graphqlClient";
import DetailComments from "./detailComments";
import PriceChart from "../charts/priceChart";
import { formatCampaignDetail } from "@/utils/format/formatCampaign";
import PriceChartWrapper from "../charts/assetPriceChartWrapper";
import { useWSForWinner } from "@/hooks/useWSForWinner";
import TimingGate from "../timingGate";
import getAmmPrices from "@/utils/getAmmPrices";
import getDppmPrices from "@/utils/getDppmPrices";

export default function DetailWrapper({
  initialData,
  priceEvents,
}: {
  initialData: CampaignDetail;
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
  useWSForWinner(data.identifier, data.poolAddress);
  const [selectedOutcome, setSelectedOutcome] = useState<SelectedOutcome>({
    id:
      data.outcomes.find((o) => o.identifier === outcomeId)?.identifier ??
      data.outcomes[0].identifier,
    state: "buy",
  });
  const ammPrices = Object.entries(getAmmPrices(data.shares) ?? {}).map(
    ([k, v]) => ({ id: k, price: v }),
  );
  const dppmPrices = getDppmPrices(data.odds);
  const sharePrices = data.isDppm ? dppmPrices : ammPrices;
  const isConcluded = Boolean(data.winner);

  return (
    <section className="flex h-full flex-col gap-8 md:flex-row md:gap-4">
      <div className="flex flex-[2] flex-col gap-8">
        <TimingGate ending={data.ending} starting={data.starting}>
          {({ isEnded, notStarted }) => (
            <DetailHeader
              data={data}
              isEnded={isEnded}
              notStarted={notStarted}
              isConcluded={isConcluded}
            />
          )}
        </TimingGate>
        {data.isDppm && data.priceMetadata ? (
          <PriceChartWrapper
            campaignData={data as SimpleCampaignDetail}
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
          <TimingGate ending={data.ending} starting={data.starting}>
            {({ isEnded, notStarted }) => (
              <DetailCall2Action
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
          </TimingGate>
        )}
        <AssetScene campaignDetail={data} />
      </div>
    </section>
  );
}
