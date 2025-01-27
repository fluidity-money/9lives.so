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
  if (!investmentAmounts.length)
    return outcomeIds.map((id) => ({
      id,
      chance: 50,
      investedAmount: "1",
      share: "1",
    }));

  return investmentAmounts!.map((o) => ({
    id: o!.id,
    chance: (Number(o!.usdc + 1e6) / Number(totalVolume + 2e6)) * 100,
    investedAmount: formatFusdc(o!.usdc + 1e6),
    share: formatFusdc(o!.share),
  }));
}
