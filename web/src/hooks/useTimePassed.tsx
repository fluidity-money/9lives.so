import { calcTimePassed } from "@/utils/calcTimeDiff";
import { useEffect, useState } from "react";
export default function useTimePassed(endTime: number) {
  const [timeLeft, setTimeLeft] = useState(calcTimePassed(endTime).text);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimePassed(endTime).text);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);
  return timeLeft;
}
