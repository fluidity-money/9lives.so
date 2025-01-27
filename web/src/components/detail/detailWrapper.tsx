"use client";
import { CampaignDetail } from "@/types";
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

export default function DetailWrapper({
  initialData,
}: {
  initialData: CampaignDetail;
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
  const isEnded = initialData.ending < Date.now();
  const isConcluded = Boolean(initialData.winner);
  const { data: sharePrices } = useSharePrices({
    tradingAddr: initialData.poolAddress as `0x${string}`,
    outcomeIds,
  });

  return (
    <>
      <div className="flex flex-[2] flex-col gap-8">
        <DetailHeader
          data={initialData}
          isEnded={isEnded}
          isConcluded={isConcluded}
        />
        <DetailOutcomeTable
          data={initialData}
          sharePrices={sharePrices}
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
          isConcluded={isConcluded}
        />
        <DetailInfo data={initialData} />
      </div>
      <div className="flex flex-1 flex-col gap-8">
        {isConcluded ? (
          <DetailResults
            data={initialData}
            tradingAddr={initialData.poolAddress}
          />
        ) : (
          <DetailCall2Action
            shouldStopAction={isEnded || isConcluded}
            selectedOutcome={selectedOutcome}
            setSelectedOutcome={setSelectedOutcome}
            data={initialData}
            price={
              sharePrices?.find((item) => item.id === selectedOutcome.id)
                ?.price ?? "0"
            }
          />
        )}
        <AssetScene
          tradingAddr={initialData.poolAddress}
          outcomes={initialData.outcomes}
        />
      </div>
    </>
  );
}
