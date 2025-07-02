import { Ticket } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PaymasterStore {
  tickets: Ticket[];
  createTicket: (newTicket: Ticket) => void;
  closeTicket: (ticketId: string) => void;
}
export const usePaymasterStore = create<PaymasterStore>()(
  persist(
    (set) => ({
      tickets: [],
      createTicket: (newTicket) =>
        set(({ tickets }) => ({ tickets: [...tickets, newTicket] })),
      closeTicket: (ticketId) =>
        set(({ tickets }) => ({
          tickets: tickets.filter((t) => t.id !== ticketId),
        })),
    }),
    {
      name: "paymaster-storage-v0.1",
    },
  ),
);
