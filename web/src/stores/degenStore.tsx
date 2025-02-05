import { create } from "zustand";

interface DegenStore {
  degenModeEnabled: boolean;
  toggleDegenMode: () => void;
}
export const useDegenStore = create<DegenStore>()((set) => ({
  degenModeEnabled: false,
  toggleDegenMode: () =>
    set(({ degenModeEnabled }) => ({
      degenModeEnabled: !degenModeEnabled,
    })),
}));
