"use client";
import useCountdown from "@/hooks/useCountdown";
import { usePathname } from "next/navigation";
export default function TradingCompetitionBanner() {
  const pathname = usePathname();
  const timeleft = useCountdown(new Date("2025-09-01").getTime());
  if (pathname.startsWith("/campaign/")) return null;
  return (
    <a className="block cursor-pointer border-b-2 border-9black bg-9layer p-3 text-center font-chicago text-sm shadow-9card md:p-4 md:text-lg">
      Win 5000 $ARB in the 9lives trading competition 💸 Now Live 💸 {timeleft}
    </a>
  );
}
