import { useEffect, useState } from "react";

const minuteUnit = 60 * 1000;
const fiveMinUnit = 5 * minuteUnit;
const fifteenMinUnit = 15 * minuteUnit;
const hourUnit = 60 * minuteUnit;
const dayUnit = hourUnit * 24;

const fifteenMinMltplr = 2;
const hourMltplr = 2;
const dayMltplr = 4;
const fiveMinMltplr = 2;

const minDecay = 0.1;

export default function usePointsForDppmMint(starting: number, ending: number) {
  const [multiplier, setMultiplier] = useState<number>();
  function calc(starting: number, ending: number) {
    const duration = ending - starting;
    const isFiveMinMarket = duration <= fiveMinUnit;
    const isFifteenMinMarket =
      duration > fiveMinUnit && duration <= fifteenMinUnit;
    const isDailyMarket = duration >= dayUnit;

    const unit = isFiveMinMarket
      ? fiveMinUnit
      : isFifteenMinMarket
        ? fifteenMinUnit
        : isDailyMarket
          ? dayUnit
          : hourUnit;

    const mltplr = isFiveMinMarket
      ? fiveMinMltplr
      : isFifteenMinMarket
        ? fifteenMinMltplr
        : isDailyMarket
          ? dayMltplr
          : hourMltplr;

    const diffMs = Date.now() - new Date(starting).getTime();
    const fractionOfTime = diffMs / unit;
    return Math.max(mltplr - fractionOfTime * (mltplr - minDecay), minDecay);
  }
  useEffect(() => {
    const timer = setInterval(() => {
      setMultiplier(calc(starting, ending));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [starting, ending]);

  return multiplier;
}
