"use client";

import { CampaignListQuery } from "@/gql/graphql";

import { useState } from "react";
import SelectedBet from "./selectedBet";
import CampaignBody from "./campaignBody";
import { SelectedOutcome } from "@/types";

type Campaign = CampaignListQuery["campaigns"][number];
interface CampaignItemProps {
  data: Campaign;
}

export default function CampaignItem({ data }: CampaignItemProps) {
  const [selectedBet, setSelectedBet] = useState<SelectedOutcome>();

  return (
    <div className="flex flex-col gap-2 rounded-[3px] border-2 border-9black bg-9gray p-3 shadow-9card">
      {selectedBet ? (
        <SelectedBet
          campaignId={data.identifier}
          data={selectedBet}
          setSelectedBet={setSelectedBet}
        />
      ) : (
        <CampaignBody data={data} setSelectedBet={setSelectedBet} />
      )}
    </div>
  );
}
