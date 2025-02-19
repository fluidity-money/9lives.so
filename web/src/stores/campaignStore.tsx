import { CampaignInput } from "@/types";
import { generateOutcomeId, generateCampaignId } from "@/utils/generateId";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CampaignStore {
  campaigns: (CampaignInput & { id: `0x${string}` })[];
  upsertCampaign: (input: CampaignInput) => void;
}
const maxDrafCount = 4;
export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set) => ({
      campaigns: [],
      upsertCampaign: (input) =>
        set((state) => {
          const campaignId = generateCampaignId(
            input.name,
            input.desc,
            input.seed,
          );
          const seededOutcomes = input.outcomes.map((outcome) => {
            return {
              ...outcome,
              id: generateOutcomeId(outcome.name, outcome.seed),
            };
          });
          const existedCampaigns = [...state.campaigns];
          if (existedCampaigns.length > maxDrafCount)
            existedCampaigns.splice(0, existedCampaigns.length - maxDrafCount);
          const updatedCampaigns = [
            ...existedCampaigns,
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
