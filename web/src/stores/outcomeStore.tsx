import { create } from "zustand";

interface OutcomeStore {
  selectedOutcome: {
    campaignId?: string;
    outcomeIdx: number;
    state: 0 | 1;
  };
  selectOutcome: ({
    campaignId,
    outcomeIdx,
    state,
  }: {
    campaignId?: string;
    outcomeIdx: number;
    state: 0 | 1;
  }) => void;
  reset: () => void;
}
const initialOutcomeState = {
  campaignId: undefined,
  outcomeIdx: 0,
  state: 1,
} as const;
export const useOutcomeStore = create<OutcomeStore>()((set) => ({
  selectedOutcome: initialOutcomeState,
  selectOutcome: ({ campaignId, outcomeIdx, state }) =>
    set({ selectedOutcome: { campaignId, outcomeIdx, state } }),
  reset: () =>
    set({
      selectedOutcome: initialOutcomeState,
    }),
}));
