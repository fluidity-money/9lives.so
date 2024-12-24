import { calcTimeLeft } from "@/utils/calcTimeDiff";
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
