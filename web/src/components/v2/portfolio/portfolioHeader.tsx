"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppKitAccount } from "@reown/appkit/react";
import makeBlockie from "ethereum-blockies-base64";
import useBalance from "@/hooks/useBalance";
import { usePortfolioStore } from "@/stores/portfolioStore";
import useTotalPnL from "@/hooks/useTotalPnL";
import useTotalVolume from "@/hooks/useTotalVolume";
import use9LivesPoints from "@/hooks/use9LivesPoints";
import useMeowDomains from "@/hooks/useMeowDomains";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import useConnectWallet from "@/hooks/useConnectWallet";
import formatFusdc from "@/utils/format/formatUsdc";
import { combineClass } from "@/utils/combineClass";
import { EVENTS, track } from "@/utils/analytics";
import SimpleClaimAllButton from "@/components/v2/claimAllButton";
import Modal from "@/components/v2/modal";
import WithdrawDialog from "@/components/withdrawDialog";
import svgPaths from "../leaderboard/svgPaths";
import { TIERS, getTierIndex } from "../leaderboard/demoData";

export default function PortfolioHeader({ overrideTierIdx }: { overrideTierIdx?: number }) {
  const account = useAppKitAccount();
  const { data: balance } = useBalance(account.address);
  const { connect } = useConnectWallet();
  const positionsValue = usePortfolioStore((s) => s.positionsValue);
  const unrealizedPnL = usePortfolioStore((s) => s.totalPnL);
  const { data: pnl } = useTotalPnL(account?.address);
  const realizedPnL = +formatFusdc(pnl?.totalPnl ?? "0", 2);
  const totalPnL = unrealizedPnL + realizedPnL;

  const { data: totalVolume } = useTotalVolume(account?.address);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const enableWithdraw = useFeatureFlag("enable paymaster withdraw");
  const { data: pointsData } = use9LivesPoints({
    address: account?.address,
    enabled: !!account.address,
  });
  const { data: domainOrAddress } = useMeowDomains(account.address ?? "");

  const netWorth = (
    Number(formatFusdc(Number(balance), 2)) + (positionsValue || 0)
  ).toFixed(2);

  const isProfitable = totalPnL >= 0;
  const points = pointsData?.[0]?.amount ?? 0;
  const rank = pointsData?.[0]?.rank ?? 0;
  const realTierIdx = getTierIndex(points);
  const tierIdx = overrideTierIdx ?? realTierIdx;
  const currentTier = TIERS[tierIdx];

  // Tier-based hero background colors
  const tierColors = [
    "#1a1a2e", // Stray Cat — dark slate
    "#0d3b47", // House Cat — deep teal
    "#2d1b69", // Oracle Cat — deep purple
    "#4a1942", // Mystic Cat — deep magenta
    "#1a1a0e", // Cosmic Cat — rich dark gold
  ];
  const heroBg = tierColors[tierIdx] ?? tierColors[0];

  return (
    <>
      <div className="relative rounded-[12px] w-full overflow-hidden transition-colors duration-700" style={{ backgroundColor: heroBg }}>
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div
            className="absolute inset-0 mix-blend-overlay opacity-[0.59] pointer-events-none bg-repeat"
            style={{ backgroundImage: "url('/images/leaderboard/grain.png')", backgroundSize: "1024px 1024px" }}
          />
        </div>

        <div className="relative flex flex-col gap-[20px] p-[24px] md:p-[32px]">
          {/* Top row: identity + points/tier */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-[16px]">
            {/* Left: avatar + name + rank */}
            <div className="flex items-center gap-[12px]">
              {account.address ? (
                <div className="relative">
                  <img
                    src={makeBlockie(account.address)}
                    alt="avatar"
                    className="size-[48px] rounded-full border-2 border-[rgba(255,255,255,0.3)]"
                  />
                  <div className="absolute bottom-0 right-0 size-[12px]">
                    <svg className="block size-full" fill="none" viewBox="0 0 9 9">
                      <circle cx="4.5" cy="4.5" fill="#22C55E" r="4" stroke="#0e0e0e" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="size-[48px] rounded-full bg-[#333] border-2 border-[#555]" />
              )}
              <div className="flex flex-col gap-[4px]">
                <span className="font-overusedGrotesk font-bold text-[#fdfdfd] text-[16px]">
                  {account.address
                    ? (domainOrAddress ?? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`)
                    : "Not Connected"}
                </span>
                <div className="flex items-center gap-[8px]">
                  <span className="font-dmMono text-[9px] uppercase text-[rgba(255,255,255,0.4)] tracking-[0.18px]">
                    Rank #{rank}
                  </span>
                  {/* Tier badge */}
                  <div className="bg-[#ffe8f5] flex items-center gap-[4px] px-[6px] py-[2px] rounded-[4px]">
                    <div className="flex items-center justify-center overflow-clip shrink-0 size-[12px]">
                      <svg className="size-full" fill="none" viewBox="0 0 8 6.54545">
                        <path d={svgPaths.p29f36f80} fill="#EA33C2" />
                      </svg>
                    </div>
                    <span className="font-dmMono font-medium text-[#ea33c2] text-[8px] uppercase tracking-[0.16px]">
                      {currentTier.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: points + quick links */}
            <div className="flex items-center gap-[16px]">
              {/* Points */}
              <div className="flex items-center gap-[6px] bg-[rgba(255,255,255,0.08)] rounded-[8px] px-[12px] py-[8px]">
                <div className="flex items-center justify-center overflow-clip shrink-0 size-[18px]">
                  <svg className="size-full" fill="none" viewBox="0 0 13 13">
                    <path d={svgPaths.p110d4800} fill="#EA33C2" />
                  </svg>
                </div>
                <span className="font-overusedGrotesk font-bold text-[#fdfdfd] text-[16px] tracking-[-0.32px]">
                  {points.toLocaleString()}
                </span>
                <span className="font-dmMono text-[9px] uppercase text-[rgba(255,255,255,0.4)] tracking-[0.18px]">
                  PTS
                </span>
              </div>
              {/* Quick links */}
              <Link
                href="/leaderboard"
                className="font-dmMono text-[9px] uppercase text-[rgba(255,255,255,0.4)] tracking-[0.18px] hover:text-[#fdfdfd] transition-colors"
              >
                Leaderboard →
              </Link>
              <Link
                href="/"
                className="font-dmMono text-[9px] uppercase text-[rgba(255,255,255,0.4)] tracking-[0.18px] hover:text-[#fdfdfd] transition-colors"
              >
                Predict →
              </Link>
            </div>
          </div>

          {/* Net Worth — hero number */}
          <div className="flex flex-col gap-[4px]">
            <span className="font-dmMono text-[11.67px] uppercase text-[rgba(255,255,255,0.4)] tracking-[0.2334px]">
              Portfolio Net Worth
            </span>
            <span className="font-overusedGrotesk font-black text-[#fdfdfd] text-[48px] md:text-[56px] tracking-[-1.92px] leading-none">
              ${netWorth}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex gap-[2px] flex-wrap">
            <div className="flex-1 min-w-[120px] bg-[rgba(255,255,255,0.06)] rounded-[8px] p-[12px] flex flex-col gap-[4px]">
              <span className="font-dmMono text-[9px] uppercase text-[rgba(255,255,255,0.35)] tracking-[0.18px]">
                PnL
              </span>
              <span
                className={combineClass(
                  "font-overusedGrotesk font-bold text-[18px]",
                  isProfitable ? "text-[#4ade80]" : "text-[#fca5a5]",
                )}
              >
                {isProfitable ? "+" : ""}${totalPnL.toFixed(2)}
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-[rgba(255,255,255,0.06)] rounded-[8px] p-[12px] flex flex-col gap-[4px]">
              <span className="font-dmMono text-[9px] uppercase text-[rgba(255,255,255,0.35)] tracking-[0.18px]">
                Volume
              </span>
              <span className="font-overusedGrotesk font-bold text-[#fdfdfd] text-[18px]">
                ${formatFusdc(totalVolume ?? 0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-[rgba(255,255,255,0.06)] rounded-[8px] p-[12px] flex flex-col gap-[4px]">
              <span className="font-dmMono text-[9px] uppercase text-[rgba(255,255,255,0.35)] tracking-[0.18px]">
                Available
              </span>
              <span className="font-overusedGrotesk font-bold text-[#fdfdfd] text-[18px]">
                ${formatFusdc(Number(balance), 2)}
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-[rgba(255,255,255,0.06)] rounded-[8px] p-[12px] flex flex-col gap-[4px]">
              <span className="font-dmMono text-[9px] uppercase text-[rgba(255,255,255,0.35)] tracking-[0.18px]">
                Positions
              </span>
              <span className="font-overusedGrotesk font-bold text-[#fdfdfd] text-[18px]">
                ${(positionsValue ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-[8px]">
            {account.isConnected ? (
              <>
                <Link href="https://bridge.superposition.so/" target="_blank" className="flex-1">
                  <button
                    className="w-full bg-[#fdfdfd] text-[#0e0e0e] rounded-[12px] py-[12px] font-overusedGrotesk font-semibold text-[14px] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                    onClick={() => track(EVENTS.FUNDING_CLICKED, { type: "portfolio" })}
                  >
                    + Deposit
                  </button>
                </Link>
                {enableWithdraw && (
                  <button
                    className="flex-1 bg-transparent border border-[rgba(255,255,255,0.3)] text-[#fdfdfd] rounded-[12px] py-[12px] font-overusedGrotesk font-semibold text-[14px] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    onClick={() => setIsWithdrawDialogOpen(true)}
                  >
                    Withdraw
                  </button>
                )}
                <div className="flex-1">
                  <SimpleClaimAllButton shouldHideOnMobile={false} />
                </div>
              </>
            ) : (
              <button
                className="w-full bg-[#fdfdfd] text-[#0e0e0e] rounded-[12px] py-[14px] font-overusedGrotesk font-semibold text-[15px] cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                onClick={() => connect()}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isWithdrawDialogOpen} setIsOpen={setIsWithdrawDialogOpen}>
        <WithdrawDialog />
      </Modal>
    </>
  );
}
