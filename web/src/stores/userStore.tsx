import { Campaign } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WatchlistItem = Omit<Campaign, "totalVolume" | "winner"> & {
  totalVolume: 0;
  winner: null;
};
interface UserStore {
  watchlist: WatchlistItem[];
  addToWatchlist: (campaign: Campaign) => void;
  removeFromWatchlist: (id: string) => void;
  trackingConsent: boolean;
  setTrackingConsent: (consent: boolean) => void;
}
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      watchlist: [],
      addToWatchlist: (c: Campaign) =>
        set(({ watchlist }) => ({
          watchlist: [...watchlist, { ...c, totalVolume: 0, winner: null }],
        })),
      removeFromWatchlist: (id: string) =>
        set(({ watchlist }) => ({
          watchlist: watchlist.filter((c) => c.identifier !== id),
        })),
      trackingConsent: false,
      setTrackingConsent: (consent: boolean) =>
        set({ trackingConsent: consent }),
    }),
    {
      name: "user-storage-v0.2",
    },
  ),
);
