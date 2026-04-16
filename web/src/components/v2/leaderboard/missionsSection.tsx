"use client";

import { useState } from "react";
import type { PState } from "./types";

export default function MissionsSection({ s }: { s: PState }) {
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const missions = tab === "daily" ? s.daily : s.weekly;

  return (
    <div className="bg-[#fafafa] relative rounded-[12px] w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute border border-[#a3a3a3] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-col items-center size-full">
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
                    className="flex flex-[1_0_0] items-center self-stretch"
                  >
                    <div
                      className={`flex-[1_0_0] h-full min-h-px min-w-px relative cursor-pointer ${
                        tab === t
                          ? "bg-[#fdfdfd] rounded-[12px] shadow-[2px_2px_8px_0px_rgba(178,178,178,0.5)]"
                          : "rounded-[8px]"
                      }`}
                      onClick={() => setTab(t)}
                    >
                      <div className="flex items-center justify-center size-full">
                        <div className="flex items-center justify-center px-[16px] py-[8px] relative size-full">
                          <span
                            className={`font-overusedGrotesk font-medium text-[14px] whitespace-nowrap ${
                              tab === t
                                ? "text-[#0e0e0e]"
                                : "text-[#a3a3a3]"
                            }`}
                          >
                            {t === "daily"
                              ? "Daily Missions"
                              : "Weekly Missions"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex gap-[10px] items-start relative shrink-0 w-full">
            <div className="flex-[1_0_0] h-[22px] min-h-px min-w-px relative rounded-[12px]">
              <div className="overflow-clip rounded-[inherit] size-full">
                <div className="flex flex-col items-start p-[4px] relative size-full">
                  <div
                    className="bg-[#a3a3a3] h-[14px] rounded-[8px] shrink-0 transition-all duration-700"
                    style={{ width: `${s.missionBarPx}px` }}
                  />
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute border border-[#0e0e0e] border-solid inset-0 pointer-events-none rounded-[12px]"
              />
            </div>
            <div className="flex font-overusedGrotesk font-bold gap-[4px] items-center justify-end self-stretch shrink-0 text-[14px] text-center whitespace-nowrap">
              <span className="text-[#a3a3a3]">Max:</span>
              <span className="text-[#0e0e0e]">200pt</span>
            </div>
          </div>

          {/* Mission cards */}
          <div className="flex flex-col gap-[10px] w-full">
            {missions.map((m, i) => {
              const done = m.pct >= 100 && m.color === "#16a34a";
              const complete = m.pct >= 100;
              return (
                <div
                  key={`${tab}-${i}`}
                  className={`relative rounded-[12px] shrink-0 w-full p-[12px] transition-all duration-300 ${
                    done ? "bg-[#f0fdf4]" : "bg-[#fdfdfd]"
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className={`absolute border border-solid inset-0 pointer-events-none rounded-[12px] ${
                      done ? "border-[#bbf7d0]" : "border-[#e5e5e5]"
                    }`}
                  />
                  <div className="flex gap-[12px] items-start relative">
                    <div
                      className={`overflow-clip relative rounded-[10px] shrink-0 size-[38px] transition-colors duration-500 flex items-center justify-center ${
                        done
                          ? "bg-[#dcfce7]"
                          : complete
                            ? "bg-[#f5f5f5]"
                            : "bg-[#f5f5f5]"
                      }`}
                    >
                      {done ? (
                        <svg
                          className="size-[18px]"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M3 8L6.5 11.5L13 5"
                            stroke="#16A34A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : complete ? (
                        <svg
                          className="size-[18px]"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M3 8L6.5 11.5L13 5"
                            stroke="#0e0e0e"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <img
                          alt=""
                          className="absolute inset-0 max-w-none object-cover size-full rounded-[10px]"
                          src="/images/leaderboard/blur.png"
                        />
                      )}
                    </div>
                    <div className="flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-0 relative">
                      <div className="flex items-start justify-between w-full gap-[8px]">
                        <span
                          className={`font-overusedGrotesk font-medium text-[13px] leading-[1.3] ${
                            done
                              ? "text-[#a3a3a3] line-through"
                              : "text-[#0e0e0e]"
                          }`}
                        >
                          {m.title}
                        </span>
                        <span
                          className={`font-dmMono font-medium px-[8px] py-[2px] rounded-[6px] text-[11px] whitespace-nowrap shrink-0 ${
                            done
                              ? "bg-[#16a34a] text-[#fdfdfd]"
                              : "bg-[#dcfce7] text-[#16a34a]"
                          }`}
                        >
                          {m.points}
                        </span>
                      </div>
                      <div className="flex gap-[8px] items-center w-full">
                        <div className="flex-[1_0_0] h-[8px] min-w-0 relative rounded-[6px]">
                          <div className="overflow-clip rounded-[inherit] size-full bg-[#f0f0f0]">
                            <div
                              className="h-full rounded-[6px] transition-all duration-700"
                              style={{
                                width: `${Math.max(m.pct, m.pct > 0 ? 8 : 0)}%`,
                                backgroundColor: m.color,
                              }}
                            />
                          </div>
                        </div>
                        <span className="font-overusedGrotesk font-medium text-[#a3a3a3] text-[11px] whitespace-nowrap">
                          {m.cur}/{m.tot}
                        </span>
                      </div>
                    </div>
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
