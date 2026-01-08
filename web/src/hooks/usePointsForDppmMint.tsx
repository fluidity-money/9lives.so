const minuteUnit = 60 * 1000;
const fifteenMinUnit = 15 * minuteUnit;
const hourUnit = 60 * minuteUnit;
const dayUnit = hourUnit * 24;

const fifteenMinMltplr = 2;
const hourMltplr = 2;
const dayMltplr = 4;

const minDecay = 0.1;

export default function usePointsForDppmMint(starting: number, ending: number) {
  const duration = ending - starting;

  const isFifteenMinMarket = duration <= fifteenMinUnit;
  const isDailyMarket = duration >= dayUnit;

  const unit = isFifteenMinMarket
    ? fifteenMinUnit
    : isDailyMarket
      ? dayUnit
      : hourUnit;

  const mltplr = isFifteenMinMarket
    ? fifteenMinMltplr
    : isDailyMarket
      ? dayMltplr
      : hourMltplr;

  const diffMs = Date.now() - new Date(starting).getTime();
  const fractionOfTime = diffMs / unit;

  return Math.max(mltplr - fractionOfTime * (mltplr - minDecay), minDecay);
}
