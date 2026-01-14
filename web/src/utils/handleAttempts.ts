import config from "@/config";
import {
  PaymasterAttempt,
  PaymasterOp,
  SimpleCampaignDetail,
  Ticket,
} from "@/types";
import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import getPeriodOfCampaign from "./getPeriodOfCampaign";
import { EVENTS, track } from "./analytics";
import { chainIdToEid } from "@/config/chains";

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
    let status = "success";
    if (!a.success) {
      status = "failed";
      toast.error(`Failed to buy outcome ${selectedOutcome.name}`);
    }
    track(EVENTS.MINT, {
      amount: t.amount,
      outcomeId: t.outcomeId,
      shareAddr: selectedOutcome.share.address,
      type: "buyWithPaymaster",
      tradingAddr: t.data.poolAddress,
      status,
      ...(t.dppmMetadata ?? {}),
    });
    qc.invalidateQueries({
      queryKey: [
        "positions",
        t.data.poolAddress,
        t.data.outcomes,
        t.address,
        t.data.isDpm,
      ],
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
    if (t.data.priceMetadata) {
      const period = getPeriodOfCampaign(t.data as SimpleCampaignDetail);
      qc.invalidateQueries({
        queryKey: ["simpleCampaign", t.data.priceMetadata.baseAsset, period],
      });
    } else {
      qc.invalidateQueries({
        queryKey: ["campaign", t.data.identifier],
      });
    }
    qc.invalidateQueries({
      queryKey: ["positionHistory", t.address, outcomeIds],
    });
    qc.invalidateQueries({
      queryKey: ["balance", t.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
  },
  SELL: (t, a, qc) => {
    if (!t.data) throw new Error("Campaign detail data is missing");
    if (!t.outcomeId) throw new Error("outcomeId is missing");
    const selectedOutcome = t.data.outcomes.find(
      (o) => o.identifier === t.outcomeId,
    )!;
    const outcomeIds = t.data.outcomes.map((o) => o.identifier);
    let status = "success";
    if (!a.success) {
      status = "failed";
      toast.error(`Failed to sell shares ${selectedOutcome.name}`);
    }
    track(EVENTS.BURN, {
      amount: t.amount,
      type: "sellWithPaymaster",
      outcomeId: t.outcomeId,
      shareAddr: selectedOutcome.share.address,
      tradingAddr: t.data.poolAddress,
      status,
    });
    qc.invalidateQueries({
      queryKey: [
        "positions",
        t.data.poolAddress,
        t.data.outcomes,
        t.address,
        t.data.isDpm,
      ],
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
      queryKey: ["positionHistory", t.address, outcomeIds],
    });
    qc.invalidateQueries({
      queryKey: ["balance", t.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
  },
  ADD_LIQUIDITY: (t, a, qc) => {
    let status = "success";
    if (!a.success) {
      status = "failed";
      toast.error(`Failed to add liquidity to ${t.data?.name}`);
    }
    track(EVENTS.ADD_LIQUIDITY, {
      amount: t.amount,
      type: "addLiquidityWithPaymaster",
      tradingAddr: t.data?.poolAddress,
      status,
    });
    qc.invalidateQueries({
      queryKey: ["balance", t.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
    qc.invalidateQueries({
      queryKey: ["userLiquidity", t.address, t.data?.poolAddress],
    });
  },
  REMOVE_LIQUIDITY: (t, a, qc) => {
    let status = "success";
    if (!a.success) {
      status = "failed";
      toast.error(`Failed to remove liquidity to ${t.data?.name}`);
    }
    track(EVENTS.REMOVE_LIQUIDITY, {
      amount: t.amount,
      type: "removeLiquidityWithPaymaster",
      tradingAddr: t.data?.poolAddress,
      status,
    });
    qc.invalidateQueries({
      queryKey: ["balance", t.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
    qc.invalidateQueries({
      queryKey: ["userLiquidity", t.address, t.data?.poolAddress],
    });
  },
  WITHDRAW_USDC: (t, a, qc) => {
    let status = "success";
    if (!a.success) {
      status = "failed";
      toast.error(`Failed to withdraw usdc`);
    }
    track(EVENTS.WITHDRAW_USDC, {
      amount: t.amount,
      chainId: t.chainId,
      chainEid: t.chainId ? chainIdToEid[t.chainId] : null,
      status,
    });
    qc.invalidateQueries({
      queryKey: ["balance", t.address, config.NEXT_PUBLIC_FUSDC_ADDR],
    });
  },
};
export default handleTicketAttempts;
