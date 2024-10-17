import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  
}
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
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
