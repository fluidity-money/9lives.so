"use client";

import { useState } from "react";

// Static placeholder — rendered behind a "Coming Soon" overlay. Real
// mission data will plug in via a hook once the feature launches.
const PLACEHOLDER_DAILY = [
  { title: "Connect wallet for the day", points: "50pt", pct: 100, cur: "1", tot: "1" },
  { title: "Complete a trade", points: "50pt", pct: 60, cur: "0", tot: "1" },
  { title: "Place a limit order", points: "30pt", pct: 0, cur: "0", tot: "1" },
  { title: "Swap any token pair", points: "25pt", pct: 0, cur: "0", tot: "1" },
];

const PLACEHOLDER_WEEKLY = [
  { title: "Trade 5 days this week", points: "200pt", pct: 40, cur: "2", tot: "5" },
  { title: "Reach $10k volume", points: "150pt", pct: 20, cur: "$2k", tot: "$10k" },
  { title: "Refer 3 new users", points: "100pt", pct: 33, cur: "1", tot: "3" },
  { title: "Hold position for 48 hours", points: "60pt", pct: 25, cur: "12h", tot: "48h" },
];

export default function MissionsSection() {
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const missions = tab === "daily" ? PLACEHOLDER_DAILY : PLACEHOLDER_WEEKLY;

  return (
    <div className="bg-[#fafafa] relative rounded-[12px] w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute border border-[#a3a3a3] border-solid inset-0 pointer-events-none rounded-[12px] z-[2]"
      />
      {/* Coming soon overlay */}
      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-[8px] pointer-events-none px-[16px] text-center">
        <span className="font-dmMono text-[10px] uppercase tracking-[0.5px] text-[#525252] bg-[#fdfdfd]/80 backdrop-blur-sm rounded-[6px] px-[10px] py-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          Coming Soon
        </span>
        <span className="font-overusedGrotesk font-bold text-[22px] text-[#0e0e0e]">
          Missions
        </span>
        <span className="font-overusedGrotesk text-[13px] text-[#525252] max-w-[320px]">
          Complete daily and weekly missions to stack points. Quests are on the
          way.
        </span>
      </div>
      <div
        aria-hidden
        className="flex flex-col items-center size-full blur-[3px] opacity-60 pointer-events-none select-none"
      >
        <div className="flex flex-col gap-[16px] items-center p-[16px] relative w-full">
          {/* Toggle */}
          <div className="h-[42px] relative rounded-[16px] shrink-0 w-full">
            <div
              aria-hidden="true"
              className="absolute bg-[#e5e5e5] inset-0 pointer-events-none rounded-[16px]"
            />
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.7)]" />
            <div className="flex items-center justify-center size-full">
              <div className="flex gap-[2px] items-center justify-center p-[4px] relative size-full z-[1]">
                {(["daily", "weekly"] as const).map((t) => (
                  <div
                    key={t}
                    className={`flex flex-[1_0_0] items-center self-stretch justify-center rounded-[12px] ${
                      tab === t ? "bg-[#fdfdfd]" : ""
                    }`}
                    onClick={() => setTab(t)}
                  >
                    <span
                      className={`font-overusedGrotesk text-[14px] uppercase ${
                        tab === t
                          ? "font-semibold text-[#0e0e0e]"
                          : "font-medium text-[#a3a3a3]"
                      }`}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mission cards */}
          <div className="flex flex-col gap-[8px] w-full">
            {missions.map((m, i) => {
              const complete = m.pct === 100;
              return (
                <div
                  key={i}
                  className="flex flex-col gap-[6px] bg-[#fdfdfd] border border-[#e5e5e5] rounded-[10px] p-[12px]"
                >
                  <div className="flex items-center justify-between gap-[8px]">
                    <span
                      className={`font-overusedGrotesk font-medium text-[13px] ${
                        complete
                          ? "text-[#16a34a] line-through"
                          : "text-[#0e0e0e]"
                      }`}
                    >
                      {m.title}
                    </span>
                    <span className="font-dmMono font-medium text-[11px] uppercase tracking-[0.22px] text-[#a3a3a3] shrink-0">
                      {m.points}
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div className="flex-1 h-[4px] rounded-[2px] bg-[#e5e5e5] overflow-hidden">
                      <div
                        className={`h-full rounded-[2px] transition-all ${
                          complete ? "bg-[#16a34a]" : "bg-[#0e0e0e]"
                        }`}
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                    <span className="font-dmMono font-medium text-[10px] text-[#a3a3a3] shrink-0">
                      {m.cur}/{m.tot}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
