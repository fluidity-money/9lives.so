import { CampaignInput, OutcomeInput } from "@/types";
import { generateId, randomValue4Uint8 } from "@/utils/generateId";
import { create } from "zustand";

interface FormStore {
  form?: CampaignInput;
  fillForm: (
    fields: Omit<CampaignInput, "id" | "seed" | "outcomes"> & {
      outcomes: Omit<OutcomeInput, "id" | "seed">[];
    },
  ) => void;
}
export const useFormStore = create<FormStore>()((set) => ({
  form: undefined,
  fillForm: (fields) =>
    set(({ form }) => {
      const campaignSeed = form?.seed ?? randomValue4Uint8();
      return {
        form: {
          ...fields,
          seed: campaignSeed,
          id: generateId(fields.name, fields.desc, campaignSeed),
          outcomes: fields.outcomes?.map((outcome, index) => {
            const existingOutcome = form?.outcomes?.[index];
            const outcomeSeed = existingOutcome?.seed ?? randomValue4Uint8();
            return {
              ...outcome,
              seed: outcomeSeed,
              id: generateId(outcome.name, outcome.description, outcomeSeed),
            };
          }),
        },
      };
    }),
}));
