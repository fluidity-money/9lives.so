import { CampaignDetail } from "@/types";

export default function useDppmChance(
  outcomeId: string,
  investmentAmounts: CampaignDetail["investmentAmounts"],
  totalVolume: CampaignDetail["totalVolume"],
): number {
  if (!investmentAmounts || investmentAmounts.length === 0) {
    return 0.5;
  }

  const totalInvestment = investmentAmounts.reduce(
    (acc, item) => acc + (item?.usdc ?? 0),
    0,
  );

  const initialLiquidity = totalVolume - totalInvestment;

  const investment = investmentAmounts.find((ia) => ia?.id === outcomeId) ?? {
    id: outcomeId,
    share: 0,
    usdc: 0,
  };

  const investmentAmount = investment.usdc + initialLiquidity / 2;

  return +(investmentAmount / totalVolume).toFixed(2);
}
