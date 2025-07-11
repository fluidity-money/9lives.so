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
  isInMiniApp: boolean;
  setIsInMiniApp: (state: boolean) => void;
}
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      watchlist: [],
      addToWatchlist: (campaign) =>
        set(({ watchlist }) => ({
          watchlist: [
            ...watchlist,
            { ...campaign, totalVolume: 0, winner: null },
          ],
        })),
      removeFromWatchlist: (id) =>
        set(({ watchlist }) => ({
          watchlist: watchlist.filter((c) => c.identifier !== id),
        })),
      trackingConsent: false,
      setTrackingConsent: (consent) => set({ trackingConsent: consent }),
      isInMiniApp: false,
      setIsInMiniApp: (state) => set({ isInMiniApp: state }),
    }),
    {
      name: "user-storage-v0.2",
    },
  ),
);
