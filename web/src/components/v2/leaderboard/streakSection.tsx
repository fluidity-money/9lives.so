"use client";

import svgPaths from "./svgPaths";
import { useStreakStatus } from "@/hooks/useLeaderboardRewards";
import { useAppKitAccount } from "@reown/appkit/react";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function StreakSection() {
  const account = useAppKitAccount();
  const { connect } = useConnectWallet();
  const { data } = useStreakStatus(account?.address);
  const days =
    data?.days ??
    ["M", "T", "W", "T", "F", "S", "S"].map((label) => ({
      label,
      date: "",
      complete: false,
    }));
  const activeDays = data?.activeStreakDays ?? 0;
  const requiredDays = data?.requiredDays ?? 4;
  const booster = data?.boosterMultiplier ?? 1;
  const qualified = data?.qualifiedForJackpot ?? false;
  const daysNeeded = Math.max(requiredDays - activeDays, 0);

  return (
    <div className="bg-[#fdfdfd] md:max-w-[450px] relative rounded-[12px] shrink-0 w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[12px] z-[2]"
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
                {activeDays} days
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
                        fill={booster > 1 ? "#FF5E00" : "#A3A3A3"}
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
                  {booster.toFixed(booster % 1 === 0 ? 0 : 1)}x
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
                  {d.label}
                </p>
              ))}
            </div>
            <div className="flex gap-[4px] items-center relative shrink-0 w-full">
              {days.map((day, i) => {
                const isGreen = day.complete;
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
              {qualified
                ? "You are qualified for the weekly jackpot"
                : `You need ${daysNeeded} more streak day${daysNeeded === 1 ? "" : "s"}`}
            </span>
            {!qualified && (
              <span className="text-[14px]"> to participate in Weekly Jackpot.</span>
            )}
          </p>

          {/* Action button */}
          <button
            type="button"
            onClick={() => {
              if (!account?.address) connect();
            }}
            className="h-[42px] relative rounded-[12px] shrink-0 w-full bg-[#0e0e0e]"
          >
            <div className="flex items-center justify-center size-full">
              <p className="font-overusedGrotesk font-medium text-[#fdfdfd] text-[14px] whitespace-nowrap">
                {account?.address ? "Continue Streak" : "Connect Wallet"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
