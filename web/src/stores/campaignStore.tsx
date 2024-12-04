import { CampaignInput } from "@/types";
import { generateId } from "@/utils/generateId";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CampaignStore {
  campaigns: (CampaignInput & { id: `0x${string}` })[];
  upsertCampaign: (input: CampaignInput) => void;
}
export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set) => ({
      campaigns: [],
      upsertCampaign: (input) =>
        set((state) => {
          const campaignId = generateId(input.name, input.desc, input.seed);
          const seededOutcomes = input.outcomes.map((outcome) => {
            return {
              ...outcome,
              id: generateId(outcome.name, outcome.description, outcome.seed),
            };
          });
          const updatedCampaigns = [
            ...state.campaigns,
            { ...input, id: campaignId, outcomes: seededOutcomes },
          ];
          return { campaigns: updatedCampaigns };
        }),
    }),
    {
      name: "campaign-storage",
    },
  ),
);
