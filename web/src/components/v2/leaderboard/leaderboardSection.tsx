"use client";

import { useState } from "react";
import { useLeaderboardOverview } from "@/hooks/useLeaderboardRewards";
import useTotalPnL from "@/hooks/useTotalPnL";
import { useAppKitAccount } from "@reown/appkit/react";
import useConnectWallet from "@/hooks/useConnectWallet";
import { combineClass } from "@/utils/combineClass";
import formatFusdc from "@/utils/format/formatUsdc";
import makeBlockie from "ethereum-blockies-base64";
import { PnlIcon, GlobeIcon, FriendsIcon } from "./icons";
import type { LeaderboardPeriod } from "@/types/leaderboardRewards";

function truncateWallet(wallet: string) {
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function LeaderboardRow({
  rank,
  wallet,
  amount,
  isHighlighted,
}: {
  rank: number;
  wallet: string;
  amount: number;
  isHighlighted?: boolean;
}) {
  const { data: history } = useTotalPnL(wallet);
  const pnl = Number(history?.totalPnl ?? "0");
  const avatarUrl = makeBlockie(wallet);

  return (
    <div
      className={combineClass(
        "flex gap-[16px] items-center overflow-clip py-[8px] px-[8px] md:px-[16px] w-full transition-colors",
        isHighlighted
          ? "bg-lb-self rounded-[6px] sticky top-0 z-10"
          : "hover:bg-[#fafafa] cursor-pointer",
      )}
    >
      <div className="font-overusedGrotesk font-medium text-[#0e0e0e] text-[14px] w-[35px] md:w-[45px]">
        #{rank}
      </div>
      <div className="flex flex-1 gap-[8px] items-center min-w-0">
        <div className={`relative rounded-full shrink-0 ${isHighlighted ? "size-[34px]" : "size-[31px]"}`}>
          <img
            alt=""
            className="absolute inset-0 object-cover rounded-full size-full"
            src={avatarUrl}
          />
        </div>
        <div className="flex flex-col gap-[2px] min-w-0">
          <span className="font-overusedGrotesk font-semibold text-[#0e0e0e] text-[14px] tracking-[-0.28px] truncate">
            {truncateWallet(wallet)}
          </span>
          {isHighlighted && (
            <span className="font-overusedGrotesk font-bold text-[#a3a3a3] text-[9px] tracking-[0.18px]">
              You
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 font-overusedGrotesk font-medium text-[#0e0e0e] text-[14px]">
        {amount}
      </div>
      <div className="hidden md:flex flex-1 gap-[4px] items-center justify-end">
        <PnlIcon positive={pnl >= 0} />
        <span
          className={combineClass(
            "font-overusedGrotesk font-medium text-[14px]",
            pnl >= 0 ? "text-[#16a34a]" : "text-[#dc2626]",
          )}
        >
          ${formatFusdc(history?.totalPnl ?? "0", 2)}
        </span>
      </div>
      <div className="hidden md:block flex-1 font-overusedGrotesk font-medium text-[#0e0e0e] text-[14px] text-right">
        ${formatFusdc(history?.volume ?? "0", 2)}
      </div>
    </div>
  );
}

export default function LeaderboardSection() {
  const [scope, setScope] = useState<"global" | "friends">("global");
  const account = useAppKitAccount();
  const { connect } = useConnectWallet();
  const periods: Array<{ label: string; value: LeaderboardPeriod }> = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Annually", value: "annually" },
  ];
  const [period, setPeriod] = useState<LeaderboardPeriod>("daily");
  const { data, isLoading } = useLeaderboardOverview(
    period,
    account?.address,
  );

  const selfEntry = data?.self;

  return (
    <div className="flex flex-1 flex-col gap-[16px] items-center min-h-px min-w-0">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row gap-[8px] md:gap-0 items-start md:items-center justify-between w-full">
        {/* Scope toggle */}
        <div className="flex gap-[2px] h-[42px] items-center justify-center p-[4px] relative rounded-[16px] shrink-0">
          <div className="absolute bg-[#e5e5e5] inset-0 pointer-events-none rounded-[16px]" />
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.7)]" />
          {(["global", "friends"] as const).map((sc) => {
            const disabled = sc === "friends";
            return (
              <div key={sc} className="flex items-center self-stretch z-[1]">
                <div
                  className={combineClass(
                    "h-full relative rounded-[12px] shrink-0",
                    disabled
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer",
                    scope === sc && !disabled && "bg-[#fdfdfd] shadow-[2px_2px_8px_0px_rgba(178,178,178,0.5)]",
                  )}
                  onClick={() => !disabled && setScope(sc)}
                >
                  <div className="flex items-center justify-center size-full">
                    <div className="flex gap-[4px] items-center justify-center px-[16px] py-[8px] size-full">
                      {sc === "global" ? (
                        <GlobeIcon active={scope === sc} />
                      ) : (
                        <FriendsIcon active={false} />
                      )}
                      <span
                        className={combineClass(
                          "font-overusedGrotesk font-medium text-[14px] whitespace-nowrap",
                          scope === sc && !disabled ? "text-[#0e0e0e]" : "text-[#a3a3a3]",
                        )}
                      >
                        {sc === "global" ? "Global" : "Friends"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Period filter */}
        <div className="flex gap-[4px] md:gap-[8px] h-full items-center shrink-0 w-full md:w-auto">
          {periods.map((p) => (
            <div
              key={p.value}
              className="h-full relative flex-1 md:flex-none md:shrink-0 md:w-[72px] cursor-pointer"
              onClick={() => setPeriod(p.value)}
            >
              {period === p.value && (
                <div className="absolute border-[#0e0e0e] border-b inset-0 pointer-events-none" />
              )}
              <div className="flex flex-col items-center justify-center size-full">
                <div className="flex flex-col items-center justify-center px-[12px] py-[8px] size-full">
                  <span
                    className={combineClass(
                      "font-overusedGrotesk font-medium text-[14px] whitespace-nowrap",
                      period === p.value ? "text-[#0e0e0e]" : "text-[#a3a3a3]",
                    )}
                  >
                    {p.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#fdfdfd] relative rounded-[12px] shrink-0 w-full">
        <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
        <div className="flex flex-col gap-[16px] items-start p-[16px] size-full">
          {/* Column headers */}
          <div className="flex font-overusedGrotesk font-medium gap-[16px] items-center text-[#a3a3a3] text-[14px] w-full px-[8px] md:px-[16px]">
            <div className="w-[35px] md:w-[45px]">Rank</div>
            <div className="flex-1">Wallet</div>
            <div className="flex-1">Points</div>
            <div className="hidden md:block flex-1 text-right">PnL</div>
            <div className="hidden md:block flex-1 text-right">Volume</div>
          </div>

          <div className="flex flex-col gap-[12px] items-start w-full">
            {/* Self row */}
            {account?.address ? (
              selfEntry ? (
                <LeaderboardRow
                  rank={selfEntry.rank}
                  wallet={selfEntry.wallet}
                  amount={selfEntry.amount}
                  isHighlighted
                />
              ) : null
            ) : (
              <div
                className="flex gap-[16px] items-center bg-[#fafafa] rounded-[6px] py-[12px] px-[16px] w-full cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                onClick={() => connect()}
              >
                <span className="font-overusedGrotesk font-medium text-[#a3a3a3] text-[14px]">
                  Connect your wallet to see your rank
                </span>
              </div>
            )}

            {/* Data rows */}
            {isLoading ? (
              <div className="w-full h-[400px] animate-pulse bg-[#f5f5f5] rounded-[8px]" />
            ) : (
              <div className="flex flex-col gap-[12px] items-start w-full overflow-y-auto max-h-[600px]">
                {data?.entries.map((item) => (
                  <LeaderboardRow
                    key={item.wallet}
                    rank={item.rank}
                    wallet={item.wallet}
                    amount={item.amount}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
