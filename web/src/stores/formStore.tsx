import { CampaignInput, OutcomeInput } from "@/types";
import { create } from "zustand";

interface FormStore {
  form?: CampaignInput;
  fillForm: (
    input: Omit<CampaignInput, "id"> & {
      outcomes: Omit<OutcomeInput, "id">[];
    },
  ) => void;
}
export const useFormStore = create<FormStore>()((set) => ({
  form: undefined,
  fillForm: (input) => set(() => ({ form: input })),
}));
