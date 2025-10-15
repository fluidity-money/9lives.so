import { useEffect, useState } from "react";
import useWeeklyVolume from "./useWeeklyVolume";

const lpRewardPerc = 0.02; // LP fee
const computeAPY = (weeklyVolume: number, totalLiquidity: number) => {
  const weeklyFees = lpRewardPerc * weeklyVolume;
  const annualFees = weeklyFees * 52;
  const apy = annualFees / totalLiquidity;
  return apy;
};

export default function useAPY(poolAddress: string, totalLiquidity: number) {
  const [APY, setAPY] = useState(0);
  const { data: weeklyVolume, isSuccess } = useWeeklyVolume(poolAddress);
  useEffect(() => {
    if (isSuccess && weeklyVolume) {
      setAPY(computeAPY(weeklyVolume, totalLiquidity));
    }
  }, [isSuccess, totalLiquidity, weeklyVolume]);
  return APY;
}
