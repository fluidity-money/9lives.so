"use client";
import svgPaths from "./svgPaths";

export default function JackpotSection() {
  // Teaser-only: always render the green "qualified" variant with
  // coming-soon copy. Real data (weekly jackpot amount, countdown,
  // daily-streak progress) will plug in once the jackpot hook exists.
  return (
    <div className="bg-lb-green h-[260px] md:h-[400px] relative shrink-0 w-full transition-colors duration-700">
      <div className="flex items-center justify-center size-full">
        <div className="flex gap-[12px] items-center justify-center p-[16px] md:p-[24px] relative size-full">
          <div className="flex flex-1 flex-col gap-[12px] h-full items-center min-h-px min-w-0">
            {/* Top row: gift + Weekly Jackpot Allocations badge */}
            <div className="flex flex-col gap-[8px] h-[150px] md:h-[244px] items-center justify-center shrink-0 w-full">
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
                  <div className="font-dmMono font-medium text-[#fdfdfd] text-[9px] md:text-[11.67px] uppercase whitespace-nowrap tracking-[0.2334px]">
                    Weekly Jackpot
                  </div>
                </div>
                <div className="flex items-center justify-end px-[8px] py-[3px] rounded-[4px] shrink-0 bg-[#fdfdfd]/15 border border-[#fdfdfd]/30">
                  <span className="font-dmMono font-medium text-[#fdfdfd] text-[9px] md:text-[10px] tracking-[0.2334px] uppercase whitespace-nowrap">
                    Weekly Jackpot Allocations
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-[8px] md:gap-[12px] h-[100px] md:h-[175px] items-center justify-center shrink-0 text-[#fdfdfd] text-center">
                <div className="flex items-center justify-center shrink-0 text-[52px] md:text-[88px] leading-none select-none">
                  🎁
                </div>
                <div className="flex flex-col gap-[4px] items-center">
                  <div className="font-overusedGrotesk font-black shrink-0 text-[22px] md:text-[32px] tracking-[-0.66px] md:tracking-[-0.96px] whitespace-nowrap">
                    Earn more points every week
                  </div>
                  <div className="font-overusedGrotesk font-medium shrink-0 text-[13px] md:text-[14px] text-[#fdfdfd]/80 w-full max-w-[320px] md:max-w-[420px]">
                    Predict, climb the leaderboard, and share in the weekly jackpot pool.
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom row: coming-soon progress teaser */}
            <div className="flex items-center justify-center shrink-0 w-full">
              <div className="flex flex-1 flex-col gap-[4px] items-center justify-center max-w-[500px] min-h-px min-w-0">
                <div className="flex font-overusedGrotesk font-medium items-center justify-between shrink-0 text-[#fdfdfd] text-[14px] w-full whitespace-nowrap">
                  <span className="font-dmMono uppercase text-[11.67px] tracking-[0.2334px]">
                    Progress
                  </span>
                  <div className="flex items-center gap-[6px] px-[10px] py-[3px] rounded-[999px] bg-[#fdfdfd]/15 border border-[#fdfdfd]/30">
                    <span className="font-dmMono font-medium text-[#fdfdfd] text-[10px] uppercase tracking-[0.2334px]">
                      Coming Soon
                    </span>
                  </div>
                </div>
                <div className="flex gap-[2px] items-center shrink-0 w-full opacity-60">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-[8px] md:h-[10px] min-h-px min-w-0 relative rounded-[4px]"
                    >
                      <div className="absolute border border-[#fdfdfd]/40 inset-0 pointer-events-none rounded-[4px]" />
                    </div>
                  ))}
                </div>
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
