import { CampaignDetail } from "@/types";

interface usePotentialReturnProps {
  investmentAmounts: CampaignDetail["investmentAmounts"];
  outcomeId: `0x${string}`;
  fusdc: number;
  share: number;
  totalInvestment: number;
}

export default function usePotentialReturn({
  totalInvestment,
  investmentAmounts,
  outcomeId,
  fusdc,
  share,
}: usePotentialReturnProps) {
  if (!investmentAmounts.length) return 0;

  const sharesOfOutcome =
    investmentAmounts.find((t) => t.id === outcomeId)?.share || 0;

  return (
    ((Number(totalInvestment) + fusdc) / (Number(sharesOfOutcome) + share)) *
    share
  );
}
