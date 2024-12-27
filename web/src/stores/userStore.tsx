import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  degenModeEnabled: boolean;
  toggleDegenMode: () => void;
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
}
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      degenModeEnabled: true,
      toggleDegenMode: () =>
        set(({ degenModeEnabled }) => ({
          degenModeEnabled: !degenModeEnabled,
        })),
      watchlist: [],
      addToWatchlist: (id: string) =>
        set(({ watchlist }) => ({
          watchlist: [...watchlist, id],
        })),
      removeFromWatchlist: (id: string) =>
        set(({ watchlist }) => ({
          watchlist: watchlist.filter((_id) => _id !== id),
        })),
    }),
    {
      name: "user-storage",
    },
  ),
);
