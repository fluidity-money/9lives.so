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
import { useQuery } from "@tanstack/react-query";
import { requestCampaignById } from "@/providers/graphqlClient";

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
  const { data } = useQuery({
    queryKey: ["campaign", initialData.identifier],
    queryFn: async () => {
      const res = (await requestCampaignById(initialData.identifier))!;
      const campaign = Object.assign(res, {
        isYesNo:
          res.outcomes.length === 2 &&
          res.outcomes.findIndex((outcome) => outcome.name === "Yes") !== -1 &&
          res.outcomes.findIndex((outcome) => outcome.name === "No") !== -1,
      });
      return campaign as CampaignDetail;
    },
    initialData,
  });
  return (
    <>
      <div className="flex flex-[2] flex-col gap-8">
        <DetailHeader data={data} isEnded={isEnded} isConcluded={isConcluded} />
        <DetailOutcomeTable
          data={data}
          sharePrices={sharePrices}
          selectedOutcome={selectedOutcome}
          setSelectedOutcome={setSelectedOutcome}
          isConcluded={isConcluded}
        />
        <DetailInfo data={data} />
      </div>
      <div className="flex flex-1 flex-col gap-8">
        {isConcluded ? (
          <DetailResults data={data} />
        ) : (
          <DetailCall2Action
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
        <AssetScene tradingAddr={data.poolAddress} outcomes={data.outcomes} />
      </div>
    </>
  );
}
