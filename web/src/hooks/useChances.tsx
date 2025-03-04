import { CampaignDetail } from "@/types";
import formatFusdc from "@/utils/formatFusdc";

export default function useChances({
  outcomeIds,
  totalVolume,
  investmentAmounts,
}: {
  outcomeIds: `0x${string}`[];
  totalVolume: number;
  investmentAmounts: CampaignDetail["investmentAmounts"];
}) {
  return outcomeIds.map((oId) => {
    const investedOutcome = investmentAmounts.find((i) => i.id === oId);
    return {
      id: oId,
      chance: Number((investedOutcome?.usdc ?? 0) / Number(totalVolume)) * 100,
      investedAmount: formatFusdc(investedOutcome?.usdc ?? 0, 2),
      share: formatFusdc(investedOutcome?.share ?? 0, 2),
    };
  });
}
