"use client";
import { Campaign } from "@/types";
import DetailHeader from "./detailHeader";
import DetailOutcomeTable from "./detailOutcomeTable";
import DetailCall2Action from "./detailAction";
import { SelectedOutcome } from "../../types";
import { useState } from "react";
import useSharePrices from "@/hooks/useSharePrices";
import DetailInfo from "./detailInfo";
import { useSearchParams } from "next/navigation";
import AssetScene from "../user/assetScene";
import useDetails from "@/hooks/useDetails";
import DetailResults from "./detailResults";

export default function DetailWrapper({
  initialData,
}: {
  initialData: Campaign;
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
  const { data: details } = useDetails({
    tradingAddr: initialData.poolAddress,
    outcomeIds,
  });
  const isEnded = initialData.ending < Date.now();
  const isConcluded = Boolean(details?.winner) || isEnded;
  const { data: sharePrices } = useSharePrices({
    tradingAddr: initialData.poolAddress as `0x${string}`,
    outcomeIds,
  });
  return (
    <>
      <div className="flex flex-[2] flex-col gap-8">
        <DetailHeader data={initialData} isConcluded={isConcluded} />
        <DetailOutcomeTable
          isYesNo={initialData.isYesNo}
          sharePrices={sharePrices}
          data={initialData.outcomes}
          tradingAddr={initialData.poolAddress}
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
          details={details}
          isConcluded={isConcluded}
        />
        <DetailInfo data={initialData.description} />
      </div>
      <div className="flex flex-1 flex-col gap-8">
        {isConcluded ? (
          <DetailResults
            results={details}
            initialData={initialData.outcomes}
            tradingAddr={initialData.poolAddress}
          />
        ) : (
          <DetailCall2Action
            selectedOutcome={selectedOutcome}
            setSelectedOutcome={setSelectedOutcome}
            initalData={initialData.outcomes}
            tradingAddr={initialData.poolAddress}
            isYesNo={initialData.isYesNo}
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
