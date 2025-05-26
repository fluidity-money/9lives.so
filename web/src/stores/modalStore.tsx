import { create } from "zustand";

interface ModalStore {
  isModalOpen: boolean;
  setModal: (open: boolean) => void;
}
export const useModalStore = create<ModalStore>()((set) => ({
  isModalOpen: false,
  setModal: (open) => set({ isModalOpen: open }),
}));
