import calcTimeDiff from "@/utils/calcTimeDiff";
import { useEffect, useState } from "react";
export default function useCountdown(endTime: number) {
  const [timeLeft, setTimeLeft] = useState(calcTimeDiff(endTime).full);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeDiff(endTime).full);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);
  return timeLeft;
}
