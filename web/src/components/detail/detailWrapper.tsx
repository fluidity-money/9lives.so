"use client";
import { Campaign } from "@/types";
import DetailHeader from "./detailHeader";
import DetailOutcomes from "./detailOutcomes";
import DetailCall2Action from "./detailAction";
import { SelectedOutcome } from "../../types";
import { useState } from "react";

export default function DetailWrapper({
  initialData,
}: {
  initialData: Campaign;
}) {
  const [selectedOutcome, setSelectedOutcome] = useState<SelectedOutcome>({
    id: initialData.outcomes[0].identifier,
    state: "buy",
  });

  return (
    <>
      <div className="flex flex-[2] flex-col gap-8">
        <DetailHeader data={initialData} />
        <DetailOutcomes
          data={initialData.outcomes}
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
        />
      </div>
      <div className="flex-1">
        <DetailCall2Action
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
          initalData={initialData.outcomes}
          tradingAddr={initialData.poolAddress}
        />
      </div>
    </>
  );
}
