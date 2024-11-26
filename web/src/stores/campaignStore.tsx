import { CampaignInput } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CampaignStore {
  campaigns: CampaignInput[];
  upsertCampaign: (fields: CampaignInput) => void;
}
export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set) => ({
      campaigns: [],
      upsertCampaign: (fields) =>
        set((state) => {
          if (!fields.id) throw Error("No id to operate");
          const index = state.campaigns.findIndex(
            (campaign) => campaign.id === fields.id,
          );
          if (index === -1) {
            return { campaigns: [...state.campaigns, { ...fields }] };
          }
          const updatedCampaigns = [...state.campaigns];
          updatedCampaigns[index] = { ...updatedCampaigns[index], ...fields };
          return { campaigns: updatedCampaigns };
        }),
    }),
    {
      name: "campaign-storage",
    },
  ),
);
