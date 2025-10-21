"use client";
import useCountdown from "@/hooks/useCountdown";
import { useEffect, useState } from "react";

export default function CountdownTimer({ endTime }: { endTime: number }) {
  const dynamicTimeLeft = useCountdown(endTime);
  const staticTimeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const timeleft = mounted ? dynamicTimeLeft : staticTimeLeft;

  return <span className="bg-9red px-0.5 py-px text-9black">{timeleft}</span>;
}
