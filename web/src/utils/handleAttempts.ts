import config from "@/config";
import { PaymasterAttempt, PaymasterOp, Ticket } from "@/types";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const handleTicketAttempts: Record<
  PaymasterOp,
  (ticket: Ticket, attempt: PaymasterAttempt, queryClient: QueryClient) => void
> = {
  MINT: (t, a, qc) => {
    if (!t.data) throw new Error("Campaign detail data is missing");
    if (!t.outcomeId) throw new Error("outcomeId is missing");
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
    qc.invalidateQueries({
      queryKey: ["balance", t.account.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
  },
  SELL: (t, a, qc) => {
    if (!t.data) throw new Error("Campaign detail data is missing");
    if (!t.outcomeId) throw new Error("outcomeId is missing");
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
    qc.invalidateQueries({
      queryKey: ["balance", t.account.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
  },
  ADD_LIQUIDITY: (t, a, qc) => {
    if (!a.success) {
      toast.error(`Failed to add liquidity to ${t.data?.name}`);
    }
    qc.invalidateQueries({
      queryKey: ["balance", t.account.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
    qc.invalidateQueries({
      queryKey: ["userLiquidity", t.account.address, t.data?.poolAddress],
    });
  },
  REMOVE_LIQUIDITY: (t, a, qc) => {
    if (!a.success) {
      toast.error(`Failed to remove liquidity to ${t.data?.name}`);
    }
    qc.invalidateQueries({
      queryKey: ["balance", t.account.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
    qc.invalidateQueries({
      queryKey: ["userLiquidity", t.account.address, t.data?.poolAddress],
    });
  },
  WITHDRAW_USDC: (t, a, qc) => {
    if (!a.success) {
      toast.error(`Failed to withdraw usdc`);
    }
    qc.invalidateQueries({
      queryKey: ["balance", t.account.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
  },
};
export default handleTicketAttempts;
