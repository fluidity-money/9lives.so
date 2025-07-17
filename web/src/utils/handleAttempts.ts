import { PaymasterAttempt, PaymasterOp, Ticket } from "@/types";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const handleTicketAttempts: Record<
  PaymasterOp,
  (ticket: Ticket, attempt: PaymasterAttempt, queryClient: QueryClient) => void
> = {
  MINT: (t, a, qc) => {
    const selectedOutcome = t.data.outcomes.find(
      (o) => o.identifier === t.outcomeId,
    )!;
    const outcomeIds = t.data.outcomes.map((o) => o.identifier);
    if (!a.success) {
      toast.error(`Failed to buy outcome ${selectedOutcome.name}`);
    }
    qc.invalidateQueries({
      queryKey: ["positions", t.data.poolAddress, t.data.outcomes, t.account],
    });
    qc.invalidateQueries({
      queryKey: ["sharePrices", t.data.poolAddress, outcomeIds],
    });
    qc.invalidateQueries({
      queryKey: [
        "returnValue",
        selectedOutcome.share.address,
        t.data.poolAddress,
        t.outcomeId,
        t.amount,
      ],
    });
    qc.invalidateQueries({
      queryKey: ["campaign", t.data.identifier],
    });
    qc.invalidateQueries({
      queryKey: ["positionHistory", outcomeIds],
    });
  },
  SELL: (t, a, qc) => {
    const selectedOutcome = t.data.outcomes.find(
      (o) => o.identifier === t.outcomeId,
    )!;
    const outcomeIds = t.data.outcomes.map((o) => o.identifier);
    if (!a.success) {
      toast.error(`Failed to sell shares ${selectedOutcome.name}`);
    }
    qc.invalidateQueries({
      queryKey: ["positions", t.data.poolAddress, t.data.outcomes, t.account],
    });
    qc.invalidateQueries({
      queryKey: ["sharePrices", t.data.poolAddress, outcomeIds],
    });
    qc.invalidateQueries({
      queryKey: [
        "returnValue",
        selectedOutcome.share.address,
        t.data.poolAddress,
        t.outcomeId,
        t.amount,
      ],
    });
    qc.invalidateQueries({
      queryKey: ["campaign", t.data.identifier],
    });
    qc.invalidateQueries({
      queryKey: ["positionHistory", outcomeIds],
    });
  },
  ADD_LIQUIDITY: (t, a, qc) => {
    //TODO
  },
  REMOVE_LIQUIDITY: (t, a, qc) => {
    //TODO
  },
};
export default handleTicketAttempts;
