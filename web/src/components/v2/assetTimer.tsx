import { useEffect, useState } from "react";
import { SimpleMarketPeriod } from "@/types";
import { combineClass } from "@/utils/combineClass";

export default function AssetTimer({
  isLive,
  period,
}: {
  isLive: boolean;
  period: SimpleMarketPeriod;
}) {
  const [progress, setProgress] = useState(isLive ? 0 : 100);

  const getPeriodMs = (period: SimpleMarketPeriod) => {
    switch (period) {
      case "5mins":
        return 5 * 60 * 1000;
      case "15mins":
        return 15 * 60 * 1000;
      case "hourly":
        return 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const calculateProgress = () => {
    const now = Date.now();
    const periodMs = getPeriodMs(period);
    if (!periodMs) return 0;

    const elapsedInPeriod = now % periodMs;
    return Math.max(0, Math.min(100, (elapsedInPeriod / periodMs) * 100));
  };

  useEffect(() => {
    if (!isLive) return;
    // setProgress(calculateProgress());

    const interval = setInterval(() => {
      setProgress(calculateProgress());
    }, 3000);

    return () => clearInterval(interval);
  }, [period]);

  return (
    <div
      className={combineClass(
        isLive ? "text-green-400" : "text-neutral-400",
        "hidden items-start justify-start gap-0.5 self-stretch md:inline-flex",
      )}
    >
      <div className="justify-center text-[9px] font-bold tracking-tight">
        {isLive ? "LIVE" : "END"}
      </div>
      <div
        className={combineClass(
          isLive ? "border-green-400" : "border-neutral-400",
          "flex h-3 w-20 items-center overflow-hidden rounded-xl border p-0.5",
        )}
      >
        <div
          className={combineClass(
            isLive ? "bg-green-400" : "bg-neutral-400",
            "h-2 rounded-full transition-all duration-300",
          )}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
