import { calcTimePassed } from "@/utils/calcTimeDiff";
import { useEffect, useState } from "react";
export default function useTimePassed(endTime: number) {
  const [timeLeft, setTimeLeft] = useState(calcTimePassed(endTime).text);
  useEffect(() => {
    const { text, unit } = calcTimePassed(endTime);
    const timer = setInterval(() => {
      setTimeLeft(text);
    }, unit);
    return () => clearInterval(timer);
  }, [endTime]);
  return timeLeft;
}
