import { create } from "zustand";
import { CampaignFilters } from "@/types";
interface NavStore {
  orderBy: CampaignFilters["orderBy"];
  categoryIdx: number;
  setOrderBy: (orderBy: CampaignFilters["orderBy"]) => void;
  setCategoryIdx: (categoryIdx: number) => void;
}
export const useNavStore = create<NavStore>()((set) => ({
  orderBy: "trending",
  categoryIdx: 0,
  setOrderBy: (orderBy) => set({ orderBy }),
  setCategoryIdx: (categoryIdx) => set({ categoryIdx }),
}));
