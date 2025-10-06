import { useEffect, useState } from "react";
const lpRewardPerc = 0.02; // LP fee
const computeAPY = ({
  initialLiquidity,
  withdrawableLiquidity,
  totalVolume,
  startDate,
}: {
  initialLiquidity: number;
  withdrawableLiquidity: number;
  totalVolume: number;
  startDate: number;
}) => {
  const daysActive = Math.max(
    1,
    (Date.now() - startDate * 1000) / (1000 * 60 * 60 * 24),
  );

  const lpShare = initialLiquidity / withdrawableLiquidity;

  const feeEarnings = totalVolume * lpRewardPerc * lpShare;

  const finalValue = initialLiquidity + feeEarnings;

  const roi = (finalValue - initialLiquidity) / initialLiquidity;

  const apyMarket = Math.pow(1 + roi, 365 / daysActive) - 1;

  return apyMarket;
};

export default function useAPY({
  initialLiquidity,
  withdrawableLiquidity,
  totalVolume,
  startDate,
}: {
  initialLiquidity: number;
  withdrawableLiquidity: number;
  totalVolume: number;
  startDate: number;
}) {
  const [APY, setAPY] = useState(0);
  useEffect(() => {
    if (initialLiquidity && withdrawableLiquidity && startDate && totalVolume) {
      setAPY(
        computeAPY({
          initialLiquidity,
          withdrawableLiquidity,
          startDate,
          totalVolume,
        }),
      );
    }
  }, [initialLiquidity, withdrawableLiquidity, startDate]);
  return APY;
}
