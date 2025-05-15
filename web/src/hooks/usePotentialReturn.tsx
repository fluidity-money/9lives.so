import { CampaignDetail } from "@/types";
import formatFusdc from "@/utils/formatFusdc";

interface usePotentialReturnProps {
  investmentAmounts: CampaignDetail["investmentAmounts"];
  outcomeId: `0x${string}`;
  fusdc: number;
  share?: number;
}
export default function usePotentialReturn({
  investmentAmounts,
  outcomeId,
  fusdc,
  share,
}: usePotentialReturnProps) {
  if (!investmentAmounts.length) return 0;
  if (!share) return 0;
  const sharesOfOutcome =
    investmentAmounts.find((t) => t.id === outcomeId)?.share || 0;
  const totalInvestment = investmentAmounts.reduce((acc, v) => acc + v.usdc, 0);
  return (
    ((Number(formatFusdc(totalInvestment, 6)) + fusdc) /
      (Number(formatFusdc(sharesOfOutcome, 2)) + share)) *
    share
  );
}
