"use client";

import svgPaths from "./svgPaths";

// Static placeholder — the section sits behind a "Coming Soon" overlay,
// so this is visual filler only. Real streak data will plug in via a hook
// once the feature launches.
const PLACEHOLDER = {
  streakDays: 3,
  booster: 1,
  boosterLabel: "2x",
};

export default function StreakSection() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const greenDays = PLACEHOLDER.streakDays;

  return (
    <div className="bg-[#fdfdfd] md:max-w-[450px] relative rounded-[12px] shrink-0 w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[12px] z-[2]"
      />
      {/* Coming soon overlay */}
      <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-[8px] pointer-events-none px-[16px] text-center">
        <span className="font-dmMono text-[10px] uppercase tracking-[0.5px] text-[#525252] bg-[#fdfdfd]/80 backdrop-blur-sm rounded-[6px] px-[10px] py-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          Coming Soon
        </span>
        <span className="font-overusedGrotesk font-bold text-[22px] text-[#0e0e0e]">
          Daily Streaks
        </span>
        <span className="font-overusedGrotesk text-[13px] text-[#525252] max-w-[320px]">
          Predict every day to build a streak and multiply your points. Keep
          predicting daily to lock it in when streaks launch.
        </span>
      </div>
      <div
        aria-hidden
        className="flex flex-col justify-center max-w-[inherit] size-full blur-[3px] opacity-60 pointer-events-none select-none"
      >
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
                {PLACEHOLDER.streakDays} days
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
                        fill={PLACEHOLDER.booster > 0 ? "#FF5E00" : "#A3A3A3"}
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
                  {PLACEHOLDER.boosterLabel}
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
                <p key={i} className="flex-[1_0_0] min-h-px min-w-0 relative">
                  {d}
                </p>
              ))}
            </div>
            <div className="flex gap-[4px] items-center relative shrink-0 w-full">
              {days.map((_, i) => {
                const isGreen = i < greenDays;
                return (
                  <div
                    key={i}
                    className={`flex-[1_0_0] h-[40px] min-h-px min-w-0 relative rounded-[999px] ${
                      isGreen ? "bg-[#16a34a]" : ""
                    }`}
                  >
                    {!isGreen && (
                      <div
                        aria-hidden="true"
                        className="absolute border-2 border-solid inset-0 pointer-events-none rounded-[999px] border-[#d4d4d4]"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eligibility message */}
          <p className="font-overusedGrotesk font-medium text-[#a3a3a3] text-[14px] text-center w-full">
            <span className="font-semibold text-[14px] tracking-[-0.28px] underline decoration-solid text-[#0e0e0e]">
              You need 2 more days streak
            </span>
            <span className="text-[14px]"> to participate in Weekly Jackpot.</span>
          </p>

          {/* Action button */}
          <div className="h-[42px] relative rounded-[12px] shrink-0 w-full bg-[#0e0e0e]">
            <div className="flex items-center justify-center size-full">
              <p className="font-overusedGrotesk font-medium text-[#fdfdfd] text-[14px] whitespace-nowrap">
                Continue Streak
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
