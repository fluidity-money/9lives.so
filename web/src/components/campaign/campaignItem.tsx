"use client";

import { CampaignListQuery } from "@/gql/graphql";
import CampaignItemHeader from "./campaignItemHeader";
import CampaignItemOutcomes from "./campaignItemOutcomes";
import CampaignItemFooter from "./campaignItemFooter";
import { useState } from "react";
import SelectedBet from "./selectedBet";

type Campaign = CampaignListQuery["campaigns"][number];
interface CampaignItemProps {
  data: Campaign;
}
export type SelectedBet = Campaign["outcomes"][number] & { bet: boolean };

export default function CampaignItem({ data }: CampaignItemProps) {
  const [selectedBet, setSelectedBet] = useState<SelectedBet>();

  return (
    <CampaignItemWrapper>
      {selectedBet ? (
        <SelectedBet
          campaignId={data.identifier}
          data={selectedBet}
          setSelectedBet={setSelectedBet}
        />
      ) : (
        <>
          <CampaignItemHeader
            name={data.name}
            identifier={data.identifier}
            solo={data.outcomes.length === 1}
            soloRatio={32}
          />
          <CampaignItemOutcomes
            campaignId={data.identifier}
            outcomes={data.outcomes}
            setSelectedBet={setSelectedBet}
          />
          <CampaignItemFooter />
        </>
      )}
    </CampaignItemWrapper>
  );
}

function CampaignItemWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-black/10 p-3 shadow-md">
      {children}
    </div>
  );
}
