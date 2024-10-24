"use client";
import { Campaign } from "@/types";
import DetailHeader from "./detailHeader";
import DetailOutcomes from "./detailOutcomes";
import DetailCall2Action from "./detailAction";
import { SelectedOutcome } from "../../types";
import { useState } from "react";
import Positions from "./positions";
import useSharePrices from "@/hooks/useSharePrices";

export default function DetailWrapper({
  initialData,
}: {
  initialData: Campaign;
}) {
  const [selectedOutcome, setSelectedOutcome] = useState<SelectedOutcome>({
    id: initialData.outcomes[0].identifier,
    state: "buy",
  });
  const outcomeIds = initialData.outcomes.map(
    (o) => o.identifier as `0x${string}`,
  );
  const { data: sharePrices } = useSharePrices({
    tradingAddr: initialData.poolAddress as `0x${string}`,
    outcomeIds,
  });

  return (
    <>
      <div className="flex flex-[2] flex-col gap-8">
        <DetailHeader data={initialData} />
        <DetailOutcomes
          sharePrices={sharePrices}
          data={initialData.outcomes}
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
        />
      </div>
      <div className="flex flex-1 flex-col gap-8">
        <DetailCall2Action
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
          initalData={initialData.outcomes}
          tradingAddr={initialData.poolAddress}
          price={
            sharePrices?.find((item) => item.id === selectedOutcome.id)
              ?.price ?? "0"
          }
        />
        <Positions
          tradingAddr={initialData.poolAddress}
          outcomes={initialData.outcomes}
        />
      </div>
    </>
  );
}
