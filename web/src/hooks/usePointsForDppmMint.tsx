const hourUnit = 60 * 60 * 1000;
const dayUnit = hourUnit * 24;
const hourMltplr = 2;
const dayMltplr = 4;
const minDecay = 0.1;
export default function usePointsForDppmMint(starting: number, ending: number) {
  const isDailyMarket = ending - starting >= 1000 * 60 * 60 * 24;
  const unit = isDailyMarket ? dayUnit : hourUnit;
  const mltplr = isDailyMarket ? dayMltplr : hourMltplr;
  const diffMs = Date.now() - new Date(starting).getTime();
  const fractionOfTime = diffMs / unit;
  return Math.max(mltplr - fractionOfTime * (mltplr - minDecay), minDecay);
}
