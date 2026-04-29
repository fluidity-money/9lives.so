"use client";

import { useState } from "react";
import {
  recordWalletConnectMission,
  useMissionProgress,
} from "@/hooks/useLeaderboardRewards";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSignMessage } from "wagmi";

export default function MissionsSection() {
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const [verifyingMissionId, setVerifyingMissionId] = useState<string | null>(
    null,
  );
  const account = useAppKitAccount();
  const queryClient = useQueryClient();
  const { signMessageAsync } = useSignMessage();
  const { data: missions = [], isLoading } = useMissionProgress(
    tab,
    account?.address,
  );

  const verifyWalletConnect = async (missionId: string) => {
    if (!account?.address) return;
    setVerifyingMissionId(missionId);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const message = `Record my 9Lives daily wallet connect mission for ${today}.`;
      const signature = await signMessageAsync({ message });
      await recordWalletConnectMission({
        wallet: account.address,
        message,
        signature,
      });
      await queryClient.invalidateQueries({ queryKey: ["leaderboard-missions"] });
      await queryClient.invalidateQueries({ queryKey: ["leaderboard-streak"] });
      await queryClient.invalidateQueries({ queryKey: ["leaderboard-jackpot"] });
    } finally {
      setVerifyingMissionId(null);
    }
  };

  return (
    <div className="bg-[#fafafa] relative rounded-[12px] w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[12px] z-[2]"
      />
      <div className="flex flex-col items-center size-full">
        <div className="flex flex-col gap-[16px] items-center p-[16px] relative w-full">
          <div className="flex items-start justify-between gap-[12px] w-full">
            <div>
              <p className="font-overusedGrotesk font-bold text-[22px] text-[#0e0e0e]">
                Missions
              </p>
              <p className="font-overusedGrotesk text-[13px] text-[#525252]">
                Complete missions to earn points and weekly jackpot progress.
              </p>
            </div>
            <span className="font-dmMono text-[10px] uppercase tracking-[0.5px] text-[#0e0e0e] bg-[#e5e5e5] rounded-[6px] px-[8px] py-[3px]">
              Auto
            </span>
          </div>

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
            {isLoading ? (
              <div className="h-[180px] w-full animate-pulse rounded-[10px] bg-[#f5f5f5]" />
            ) : (
              missions.map((m) => {
                const pct = Math.min(
                  (m.progress / Math.max(m.target, 1)) * 100,
                  100,
                );
                const complete = m.completed;
                return (
                  <div
                    key={m.id}
                    className="flex flex-col gap-[6px] bg-[#fdfdfd] border border-[#e5e5e5] rounded-[10px] p-[12px]"
                  >
                    <div className="flex items-start justify-between gap-[10px]">
                      <div className="flex min-w-0 items-start gap-[9px]">
                        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] text-[18px]">
                          {m.icon || "🎯"}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={`font-overusedGrotesk font-medium text-[13px] ${
                              complete
                                ? "text-[#16a34a] line-through"
                                : "text-[#0e0e0e]"
                            }`}
                          >
                            {m.title}
                          </span>
                          <p className="font-overusedGrotesk text-[12px] text-[#737373]">
                            {m.description}
                          </p>
                        </div>
                      </div>
                      <span className="font-dmMono font-medium text-[11px] uppercase tracking-[0.22px] text-[#a3a3a3] shrink-0">
                        +{m.pointReward}pt
                      </span>
                    </div>
                    {m.template === "daily_wallet_connect" &&
                      account?.address &&
                      !complete && (
                        <button
                          onClick={() => verifyWalletConnect(m.id)}
                          disabled={verifyingMissionId === m.id}
                          className="h-[30px] self-start rounded-[8px] border border-[#0e0e0e] px-[10px] font-overusedGrotesk text-[12px] font-semibold text-[#0e0e0e] disabled:border-[#d4d4d4] disabled:text-[#a3a3a3]"
                        >
                          {verifyingMissionId === m.id ? "Verifying" : "Verify"}
                        </button>
                      )}
                    <div className="flex items-center gap-[8px]">
                      <div className="flex-1 h-[4px] rounded-[2px] bg-[#e5e5e5] overflow-hidden">
                        <div
                          className={`h-full rounded-[2px] transition-all ${
                            complete ? "bg-[#16a34a]" : "bg-[#0e0e0e]"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-dmMono font-medium text-[10px] text-[#a3a3a3] shrink-0">
                        {m.progress}/{m.target}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
