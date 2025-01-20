"use client";

import { useState } from "react";
import Link from "next/link";

import SelectedOutcome from "./selectedOutcome";
import CampaignBody from "./campaignBody";
import {
  Campaign,
  Outcome,
  SelectedOutcome as SelectedOutcomeType,
} from "@/types";

interface CampaignItemProps {
  data: Campaign;
}

export default function CampaignItem({ data }: CampaignItemProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<SelectedOutcomeType>();

  return (
    <Link href={`/campaign/${data.identifier}`} className="flex flex-1">
      <div className="flex flex-col gap-2 rounded-[3px] border-2 border-9black bg-9gray p-3 shadow-9card w-full">
        {selectedOutcome ? (
          <SelectedOutcome
            campaignId={data.identifier}
            selectedState={selectedOutcome.state}
            data={
              data.outcomes.find(
                (o) => o.identifier === selectedOutcome.id,
              )! as Outcome
            }
            setSelectedOutcome={setSelectedOutcome}
          />
        ) : (
          <CampaignBody data={data} setSelectedOutcome={setSelectedOutcome} />
        )}
      </div>
    </Link>
  );
}
