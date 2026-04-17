"use client";

import type { PState } from "./types";
import svgPaths from "./svgPaths";

export default function StreakSection({ s }: { s: PState }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const greenDays = s.streakMode === "lost" ? s.lostDay : s.streakDays;

  return (
    <div className="bg-[#fdfdfd] md:max-w-[450px] relative rounded-[12px] shrink-0 w-full">
      <div
        aria-hidden="true"
        className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[12px]"
      />
      <div className="flex flex-col justify-center max-w-[inherit] size-full">
        <div className="flex flex-col gap-[16px] items-start justify-center max-w-[inherit] p-[12px] md:p-[16px] relative size-full">
          {/* Header */}
          <div className="flex gap-[8px] items-center relative shrink-0 w-full">
            <div className="flex items-center justify-center overflow-clip p-[2px] relative shrink-0 size-[32px]">
              <div className="aspect-[20/20.571] h-full relative shrink-0">
                <div className="absolute inset-[-4.17%_-5.36%]">
                  <svg
                    className="block size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 20.6667 26"
                  >
                    <path
                      d={svgPaths.p25e68900}
                      fill="#FACC15"
                      stroke="#EAB308"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-[103px]">
              <span className="font-overusedGrotesk font-semibold text-[#0e0e0e] text-[20.16px] tracking-[-0.4032px]">
                {s.streakMode === "lost" ? 0 : s.streakDays} days
              </span>
              <span className="font-overusedGrotesk font-medium text-[#a3a3a3] text-[14px]">
                My Active Streak
              </span>
            </div>
            <div className="flex flex-[1_0_0] flex-col gap-[4px] items-end justify-center min-h-px min-w-0 relative">
              <div className="flex gap-[2px] items-center justify-end relative shrink-0 w-full">
                <div className="relative shrink-0 size-[16px]">
                  <svg
                    className="absolute block inset-0 size-full"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 16 16"
                  >
                    <g clipPath="url(#clip_boost)">
                      <path
                        d={svgPaths.pa521700}
                        fill={s.booster > 0 ? "#FF5E00" : "#A3A3A3"}
                      />
                    </g>
                    <defs>
                      <clipPath id="clip_boost">
                        <rect fill="white" height="16" width="16" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <span className="font-overusedGrotesk font-bold text-[#0e0e0e] text-[16.8px] leading-[22px] tracking-[-0.336px]">
                  {s.boosterLabel}
                </span>
              </div>
              <span className="font-overusedGrotesk font-medium text-[#a3a3a3] text-[14px] text-right w-full">
                Active Booster
              </span>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex flex-col gap-[4px] h-[62px] items-start justify-center relative shrink-0 w-full">
            <div className="flex flex-[1_0_0] font-overusedGrotesk font-semibold gap-[4px] items-center min-h-px min-w-0 relative text-[#a3a3a3] text-[14px] text-center tracking-[-0.28px] w-full">
              {days.map((d, i) => (
                <p
                  key={i}
                  className="flex-[1_0_0] min-h-px min-w-0 relative"
                >
                  {d}
                </p>
              ))}
            </div>
            <div className="flex gap-[4px] items-center relative shrink-0 w-full">
              {days.map((_, i) => {
                const isGreen = i < greenDays;
                const isLostDay =
                  s.streakMode === "lost" && i === s.lostDay;
                const hasCatIcon = i === 4 && !isGreen && !isLostDay;
                const hasBoosterIcon =
                  isGreen && i > 0 && s.booster > 0;

                return (
                  <div
                    key={i}
                    className={`flex-[1_0_0] h-[40px] min-h-px min-w-0 relative rounded-[999px] transition-all duration-500 ${
                      isGreen
                        ? "bg-[#16a34a]"
                        : isLostDay
                          ? "bg-[#fca5a5]"
                          : ""
                    }`}
                  >
                    {!isGreen && !isLostDay && (
                      <div
                        aria-hidden="true"
                        className="absolute border-2 border-solid inset-0 pointer-events-none rounded-[999px] border-[#d4d4d4]"
                      />
                    )}
                    <div className="flex items-center justify-center size-full">
                      {isLostDay ? (
                        <svg
                          className="size-[16px]"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M4 4L12 12M12 4L4 12"
                            stroke="#dc2626"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : isGreen && hasBoosterIcon ? (
                        <div className="relative shrink-0 size-[16px]">
                          <svg
                            className="absolute block inset-0 size-full"
                            fill="none"
                            preserveAspectRatio="none"
                            viewBox="0 0 16 16"
                          >
                            <g clipPath={`url(#clip_bc_${i})`}>
                              <path
                                d={svgPaths.pa521700}
                                fill="#FDFDFD"
                              />
                            </g>
                            <defs>
                              <clipPath id={`clip_bc_${i}`}>
                                <rect
                                  fill="white"
                                  height="16"
                                  width="16"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                      ) : isGreen ? (
                        <div className="size-full" />
                      ) : hasCatIcon ? (
                        <div className="flex items-center justify-center p-[4px] relative size-full">
                          <div className="flex items-center justify-center overflow-clip p-[2px] relative shrink-0 size-[24px]">
                            <div className="flex-[1_0_0] h-full min-h-px min-w-0 relative">
                              <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
                                <div className="flex flex-col items-center justify-center p-[2px] relative size-full">
                                  <div className="aspect-[16/15.2] relative shrink-0 w-full">
                                    <svg
                                      className="absolute block inset-0 size-full"
                                      fill="none"
                                      preserveAspectRatio="none"
                                      viewBox="0 0 16 15.2"
                                    >
                                      <path
                                        d={svgPaths.p19ac7e00}
                                        fill="#737373"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-[4px] size-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jackpot info */}
          <p className="font-overusedGrotesk font-medium text-[#a3a3a3] text-[14px] text-center w-full">
            {s.msgBold ? (
              <>
                <span
                  className="font-semibold text-[14px] tracking-[-0.28px] underline decoration-solid"
                  style={{ color: s.msgBoldColor }}
                >
                  {s.msgBold}
                </span>
                <span className="text-[14px]">{s.msgNormal}</span>
              </>
            ) : (
              <span className="text-[#16a34a] font-semibold text-[14px]">
                {s.msgNormal}
              </span>
            )}
          </p>

          {/* Buttons */}
          {s.streakMode === "lost" ? (
            <div className="flex gap-[8px] items-center relative shrink-0 w-full">
              <div className="flex-[1_0_0] h-[42px] min-h-px min-w-0 relative rounded-[12px] cursor-pointer hover:bg-[#f5f5f5] transition-colors">
                <div
                  aria-hidden="true"
                  className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[12px]"
                />
                <div className="flex items-center justify-center size-full">
                  <p className="font-overusedGrotesk font-medium text-[#0e0e0e] text-[14px] whitespace-nowrap">
                    {s.btnText}
                  </p>
                </div>
              </div>
              <div className="flex-[2_0_0] h-[42px] min-h-px min-w-0 relative rounded-[12px] bg-[#0e0e0e] cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                <div className="flex items-center justify-center size-full">
                  <p className="font-overusedGrotesk font-medium text-[#fdfdfd] text-[14px] whitespace-nowrap">
                    {s.btnText2}
                  </p>
                </div>
              </div>
            </div>
          ) : s.streakMode === "share" ? (
            <div className="h-[42px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#f5f5f5] transition-colors">
              <div
                aria-hidden="true"
                className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[12px]"
              />
              <div className="flex items-center justify-center size-full">
                <div className="flex gap-[6px] items-center justify-center px-[12px] py-[6px] relative size-full">
                  <svg
                    className="size-[16px] shrink-0"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M4 10C5.10457 10 6 9.10457 6 8C6 6.89543 5.10457 6 4 6C2.89543 6 2 6.89543 2 8C2 9.10457 2.89543 10 4 10Z"
                      stroke="#0e0e0e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6Z"
                      stroke="#0e0e0e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                      stroke="#0e0e0e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.8 9.2L10.2 11.2"
                      stroke="#0e0e0e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.2 4.8L5.8 6.8"
                      stroke="#0e0e0e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="font-overusedGrotesk font-medium text-[#0e0e0e] text-[14px] whitespace-nowrap">
                    {s.btnText}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`h-[42px] relative rounded-[12px] shrink-0 w-full cursor-pointer transition-colors ${
                s.streakMode === "complete"
                  ? "bg-[#16a34a] hover:bg-[#15803d]"
                  : "bg-[#0e0e0e] hover:bg-[#2a2a2a]"
              }`}
            >
              <div className="flex items-center justify-center size-full">
                <div className="flex gap-[4px] items-center justify-center px-[12px] py-[6px] relative size-full">
                  <p className="font-overusedGrotesk font-medium text-[#fdfdfd] text-[14px] whitespace-nowrap">
                    {s.btnText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
