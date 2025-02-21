import { create } from "zustand";

interface PortfolioStore {
  positionsValue: number;
  positions: { outcomeId: string; value: number }[];
  addPositionValue: (params: { outcomeId: string; value: number }) => void;
  removePositionValue: (outcomeId: string) => void;
  reset: () => void;
}
export const usePortfolioStore = create<PortfolioStore>()((set) => ({
  positionsValue: 0,
  positions: [],
  addPositionValue: ({ outcomeId, value }) =>
    set(({ positions }) => {
      let updated = false;
      const _positions = positions.map((p) =>
        p.outcomeId === outcomeId ? ((updated = true), { ...p, value }) : p,
      );
      if (!updated) _positions.push({ outcomeId, value });
      const _positionsValue = _positions.reduce((acc, v) => acc + v.value, 0);
      return { positions: _positions, positionsValue: _positionsValue };
    }),
  removePositionValue: (outcomeId) =>
    set(({ positions }) => ({
      positions: positions.filter((p) => p.outcomeId !== outcomeId),
    })),
  reset: () => set({ positions: [], positionsValue: 0 }),
}));
