"use client";
import type { PState } from "./types";
import svgPaths from "./svgPaths";

export default function JackpotSection({ s }: { s: PState }) {
  const qualified = s.jackpotFilled >= 4;
  const ineligible = s.streakMode === "lost";

  const bgColor = ineligible
    ? "bg-[#dc2626]"
    : qualified
      ? "bg-[#0e0e0e]"
      : "bg-lb-green";

  const headerLabel = ineligible
    ? "WEEK 5 ENDS IN"
    : "WEEK 5 JACKPOT ALLOCATION";

  const bodyText = ineligible
    ? (
        <p>
          You can participate in the weekly jackpot by{" "}
          <span className="font-bold">meeting weekly requirement.</span>
        </p>
      )
    : qualified
      ? "You've qualified for this week's Jackpot!"
      : "This week Requires 4 Days Streak to enter.";

  return (
    <div
      className={`${bgColor} h-[400px] relative shrink-0 w-full transition-colors duration-700`}
    >
      <div className="flex items-center justify-center size-full">
        <div className="flex gap-[12px] items-center justify-center p-[24px] relative size-full">
          <div className="flex flex-1 flex-col gap-[12px] h-full items-center min-h-px min-w-px">
            {/* Jackpot header */}
            <div className="flex flex-col gap-[8px] h-[244px] items-center justify-center shrink-0 w-full">
              <div className="flex h-[23px] items-center justify-between shrink-0 w-full">
                <div className="flex gap-[4px] items-center px-[4px] py-[2px] rounded-[4px] shrink-0">
                  <div className="overflow-clip shrink-0 size-[12px]">
                    <svg
                      className="size-full"
                      fill="none"
                      viewBox="0 0 9.99957 7.86562"
                    >
                      <path d={svgPaths.p33b97700} fill="#FDFDFD" />
                      <path d={svgPaths.p2080f0f0} fill="#FDFDFD" />
                      <path d={svgPaths.p2527b900} fill="#FDFDFD" />
                      <path d={svgPaths.p385b7500} fill="#FDFDFD" />
                      <path d={svgPaths.p2974a3f0} fill="#FDFDFD" />
                      <path d={svgPaths.p12e9c600} fill="#FDFDFD" />
                    </svg>
                  </div>
                  <div className="font-dmMono font-medium text-[#fdfdfd] text-[11.67px] uppercase whitespace-nowrap">
                    {headerLabel}
                  </div>
                </div>
                <div
                  className={`flex items-center justify-end px-[6px] py-[2px] rounded-[4px] shrink-0 ${
                    ineligible ? "bg-[#f59e0b]" : "bg-[#fdfdfd]"
                  }`}
                >
                  <div
                    className={`flex font-dmMono font-medium gap-[4px] items-start text-[9px] tracking-[0.18px] uppercase whitespace-nowrap ${
                      ineligible ? "text-[#fdfdfd]" : "text-[#0e0e0e]"
                    }`}
                  >
                    <span>3D</span>
                    <span>:</span>
                    <span>12H</span>
                    <span>:</span>
                    <span>43M</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[12px] h-[175px] items-center justify-center shrink-0 text-[#fdfdfd] text-center">
                <div className="flex font-overusedGrotesk font-black items-center justify-center shrink-0 text-[72px] tracking-[-2.88px] whitespace-nowrap">
                  <span>5,000</span>
                  <span>pts</span>
                </div>
                <div className="font-overusedGrotesk font-medium shrink-0 text-[14px] w-[300px]">
                  {bodyText}
                </div>
              </div>
            </div>
            {/* Progress / Status */}
            <div className="flex items-center justify-center shrink-0 w-full">
              <div className="flex flex-1 flex-col gap-[4px] items-center justify-center max-w-[500px] min-h-px min-w-px">
                <div className="flex font-overusedGrotesk font-medium items-center justify-between shrink-0 text-[#fdfdfd] text-[14px] w-full whitespace-nowrap">
                  <span className="font-dmMono uppercase text-[11.67px]">
                    Progress
                  </span>
                  {ineligible ? (
                    <div className="flex gap-[8px] items-center">
                      {/* Concluded bar */}
                      <div className="flex-1" />
                      {/* Ineligible badge */}
                      <div className="bg-[#991b1b] flex gap-[6px] items-center px-[12px] py-[4px] rounded-[999px]">
                        <svg
                          className="size-[12px]"
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M4 4L12 12M12 4L4 12"
                            stroke="#fdfdfd"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="font-overusedGrotesk font-semibold text-[#fdfdfd] text-[13px]">
                          Ineligible
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span>
                      {Math.min(s.jackpotFilled, 4)} / 4 Days
                    </span>
                  )}
                </div>
                {ineligible ? (
                  <div className="h-[42px] relative rounded-[12px] shrink-0 w-full">
                    <div className="absolute border border-[rgba(255,255,255,0.3)] inset-0 pointer-events-none rounded-[12px]" />
                    <div className="flex items-center justify-center size-full">
                      <span className="font-dmMono font-medium text-[rgba(255,255,255,0.6)] text-[11.67px] uppercase tracking-[0.2334px]">
                        JACKPOT CONCLUDED
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-[2px] items-center shrink-0 w-full">
                    <div className="bg-[#fdfdfd] flex-1 h-[10px] min-h-px min-w-px rounded-[4px]" />
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-[10px] min-h-px min-w-px relative rounded-[4px] transition-all duration-500"
                      >
                        {i <= s.jackpotFilled ? (
                          <div className="bg-[#fdfdfd] h-full rounded-[4px] w-full" />
                        ) : (
                          <div className="absolute border border-[#fdfdfd] inset-0 pointer-events-none rounded-[4px]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-50 pointer-events-none">
            <div
              className="absolute inset-0 mix-blend-overlay opacity-[0.59] pointer-events-none bg-repeat"
              style={{
                backgroundImage: "url('/images/leaderboard/grain.png')",
                backgroundSize: "1024px 1024px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
