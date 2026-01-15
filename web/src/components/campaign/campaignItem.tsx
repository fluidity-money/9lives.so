"use client";

import { useState } from "react";

import SelectedOutcome from "./selectedOutcome";
import CampaignBody from "./campaignBody";
import {
  Campaign,
  Outcome,
  SelectedOutcome as SelectedOutcomeType,
} from "@/types";
import { useRouter } from "next/navigation";

interface CampaignItemProps {
  data: Campaign;
}

export default function CampaignItem({ data }: CampaignItemProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<SelectedOutcomeType>();
  const router = useRouter();
  return (
    <div
      className="flex flex-1 flex-col justify-between gap-2 rounded-[3px] border-2 border-9black bg-9gray p-3 shadow-9card"
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/campaign/${data.identifier}`);
      }}
    >
      {selectedOutcome ? (
        <SelectedOutcome
          campaignId={data.identifier}
          data={
            data.outcomes.find(
              (o) => o.identifier === selectedOutcome.id,
            )! as Outcome
          }
          setSelectedOutcome={setSelectedOutcome}
        />
      ) : (
        <CampaignBody data={data} />
      )}
    </div>
  );
}
