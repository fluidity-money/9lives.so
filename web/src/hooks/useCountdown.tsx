import { calcSecondsLeft, calcTimeLeft } from "@/utils/calcTimeDiff";
import { useEffect, useState } from "react";
export default function useCountdown(endTime: number) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(endTime).full);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(endTime).full);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);
  return timeLeft;
}

export function useCountdownDiff(leftSeconds?: number) {
  const [_leftSeconds, set_leftSeconds] = useState<number>();
  const [time, setTime] = useState("Loading...");
  useEffect(() => {
    const timer = setInterval(() => {
      leftSeconds && set_leftSeconds((ls) => (ls ? ls - 1 : leftSeconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [leftSeconds]);

  useEffect(() => {
    _leftSeconds && setTime(calcSecondsLeft(_leftSeconds).full);
  }, [_leftSeconds]);

  return time;
}
