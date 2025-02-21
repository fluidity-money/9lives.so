"use client";

import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import Button from "../themed/button";
import config from "@/config";
import useMeowDomains from "@/hooks/useMeowDomains";
import AchYellow from "#/icons/ach-y.svg";
import Image from "next/image";
import formatFusdc from "@/utils/formatFusdc";
import useConnectWallet from "@/hooks/useConnectWallet";
import Link from "next/link";
import { EVENTS, track } from "@/utils/analytics";
import useAchievmentCount from "@/hooks/useAchievementCount";
import { usePortfolioStore } from "@/stores/portfolioStore";

export default function PortfolioHeader() {
  const account = useActiveAccount();
  const { data: balance } = useWalletBalance({
    address: account?.address,
    tokenAddress: config.NEXT_PUBLIC_FUSDC_ADDR,
    client: config.thirdweb.client,
    chain: config.chains.currentChain,
  });
  const domainOrAddress = useMeowDomains(account?.address);
  const { connect } = useConnectWallet();
  const { data: achievmentCount } = useAchievmentCount(account?.address);
  const positionsValue = usePortfolioStore((s) => s.positionsValue);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-5">
            <div className="size-10 bg-9blueLight" />
            <div className="flex flex-col gap-1">
              <span className="font-chicago">My Portfolio Net-worth</span>
              <span className="font-chicago">
                $
                {(
                  Number(formatFusdc(Number(balance?.value) || 0)) +
                  (positionsValue || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
          {account ? (
            <span className="rounded-[3px] border border-9black bg-9gray p-1 font-geneva text-xs uppercase tracking-wide text-9black md:self-start">
              {domainOrAddress}
            </span>
          ) : (
            <Button
              title="Connect your wallet"
              onClick={connect}
              className={"md:self-start"}
            />
          )}
        </div>
        <div className="flex items-center gap-4 font-chicago md:gap-[70px]">
          <div className="flex flex-col items-center gap-1 md:items-end">
            <span className="text-xs">Achievements</span>
            <span className="text-2xl text-9black">{achievmentCount}</span>
          </div>
          <div className="flex flex-col items-center gap-1 md:items-end">
            <span className="text-xs">Current Rank</span>
            <div className="flex items-center gap-1">
              <Image src={AchYellow} width={22} alt="Achievement" />
              <span className="text-2xl text-9black">#0</span>
            </div>
          </div>
        </div>
      </div>
      <div className="rouded-[3px] flex flex-col items-center justify-between gap-4 border border-9black bg-9gray p-5 font-chicago shadow-9orderSummary md:flex-row">
        <div className="flex items-center gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs">My Available Cash</span>
            <span className="text-2xl">
              ${formatFusdc(Number(balance?.value) || 0)}
            </span>
          </div>
          <Link
            href={"https://bridge.superposition.so/"}
            target="_blank"
            className={"flex flex-1"}
          >
            <Button
              title="+ Deposit"
              intent={"cta"}
              onClick={() => {
                track(EVENTS.FUNDING_CLICKED, {
                  type: "portfolio",
                });
              }}
            />
          </Link>
        </div>

        <div className="flex gap-4 md:gap-[70px]">
          <div className="flex flex-col gap-1">
            <span className="text-xs">PnL</span>
            <span className="text-[#808080] md:text-xl">Coming Soon</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs">Volume</span>
            <span className="text-[#808080] md:text-xl">Coming Soon</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs">Position Value</span>
            <span className="text-9black md:text-2xl">
              ${(positionsValue ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
