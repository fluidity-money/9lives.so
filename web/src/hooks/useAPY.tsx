import useWeeklyVolume from "./useWeeklyVolume";

const lpRewardPerc = 0.02; // LP fee
const computeAPY = (weeklyVolume: number, totalLiquidity: number) => {
  const weeklyFees = lpRewardPerc * weeklyVolume;
  const annualFees = weeklyFees * 52;
  const apy = annualFees / totalLiquidity;
  return apy;
};

export default function useAPY(poolAddress: string, totalLiquidity: number) {
  const { data: weeklyVolume, isSuccess } = useWeeklyVolume(poolAddress);
  const APY =
    isSuccess && weeklyVolume && totalLiquidity
      ? computeAPY(weeklyVolume, totalLiquidity)
      : 0;

  return APY;
}
