import { Action } from "@/types";
import { create } from "zustand";

interface DegenStore {
  degenModeEnabled: boolean;
  toggleDegenMode: () => void;
  actions: Action[];
  pushActions: (actions: Action[]) => void;
}
export const useDegenStore = create<DegenStore>()((set) => ({
  degenModeEnabled: true,
  toggleDegenMode: () =>
    set(({ degenModeEnabled }) => ({
      degenModeEnabled: !degenModeEnabled,
    })),
  actions: [],
  pushActions: (actions: Action[]) =>
    set((state) => {
      const lastPoint = state.actions[state.actions.length - 1]?.timestamp;
      let newItems: Action[] = [];
      if (lastPoint) {
        newItems = actions.filter(
          (action) => new Date(action.timestamp) > new Date(lastPoint),
        );
      } else {
        newItems = actions;
      }
      const prevItems = state.actions;
      if (
        prevItems &&
        prevItems.length &&
        prevItems.length + newItems.length > 20
      ) {
        prevItems.splice(0, newItems.length);
      }
      return { actions: [...newItems, ...prevItems] };
    }),
}));
