"use client";
import useCountdown from "@/hooks/useCountdown";

export default function CountdownTimer({ endTime }: { endTime: number }) {
  const timeleft = useCountdown(endTime);

  return (
    <span suppressHydrationWarning className="bg-9red px-0.5 py-px text-9black">
      {timeleft}
    </span>
  );
}
