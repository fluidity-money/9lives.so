"use client";
import { CampaignDetail, PriceEvent, PricePoint } from "@/types";
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
import PriceChart from "../priceChart";
import AssetPriceChart from "../assetPriceChart";
import { formatCampaignDetail } from "@/utils/format/formatCampaign";

export default function DetailWrapper({
  initialData,
  priceEvents,
  initialAssetPrices,
}: {
  initialData: CampaignDetail;
  priceEvents: PriceEvent[];
  initialAssetPrices?: PricePoint[];
}) {
  const outcomeId = useSearchParams()?.get("outcomeId");
  const [selectedOutcome, setSelectedOutcome] = useState<SelectedOutcome>({
    id:
      initialData.outcomes.find((o) => o.identifier === outcomeId)
        ?.identifier ?? initialData.outcomes[0].identifier,
    state: "buy",
  });
  const outcomeIds = initialData.outcomes.map(
    (o) => o.identifier as `0x${string}`,
  );
  const isEnded =
    initialData.ending.toString().length === 10
      ? initialData.ending < Date.now() / 1000
      : initialData.ending < Date.now();
  const isConcluded = Boolean(initialData.winner);
  const { data: sharePrices } = useSharePrices({
    tradingAddr: initialData.poolAddress as `0x${string}`,
    outcomeIds,
  });
  const { data } = useQuery({
    queryKey: ["campaign", initialData.identifier],
    queryFn: async () => {
      const res = (await requestCampaignById(initialData.identifier))!;
      const campaign = formatCampaignDetail(res);
      return campaign;
    },
    initialData,
  });
  const symbol = data.priceMetadata?.baseAsset?.toLowerCase();
  const { data: assetPrices, isSuccess: assetsLoaded } = useQuery<PricePoint[]>(
    {
      queryKey: ["assetPrices", symbol, data.starting, data.ending],
      initialData: initialAssetPrices,
      enabled: !!data.isDppm,
    },
  );
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
          data={data}
          isEnded={isEnded}
          isConcluded={isConcluded}
          initialAssetPrices={initialAssetPrices}
        />
        {data.isDppm && data.priceMetadata ? (
          <AssetPriceChart
            id={data.identifier}
            starting={data.starting}
            ending={data.ending}
            basePrice={Number(data.priceMetadata.priceTargetForUp)}
            symbol={data.priceMetadata.baseAsset}
            assetsLoaded={assetsLoaded}
            assetPrices={assetPrices}
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
          <DetailResults data={data} isDpm={data.isDpm} />
        ) : (
          <DetailCall2Action
            isDppm={data.isDppm}
            isDpm={data.isDpm}
            shouldStopAction={isEnded || isConcluded}
            selectedOutcome={selectedOutcome}
            setSelectedOutcome={setSelectedOutcome}
            data={data}
            price={
              sharePrices?.find((item) => item.id === selectedOutcome.id)
                ?.price ?? "0"
            }
          />
        )}
        <AssetScene
          isDetailDpm={data.isDpm}
          positionGrops={[
            {
              tradingAddr: data.poolAddress,
              outcomes: data.outcomes,
              campaignId: data.identifier,
              campaignName: data.name,
              isDpm: data.isDpm,
            },
          ]}
          campaignId={data.identifier}
          detailPage={true}
        />
      </div>
    </section>
  );
}
