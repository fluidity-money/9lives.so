"use client";

import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import Button from "../themed/button";
import config from "@/config";
import useMeowDomains from "@/hooks/useMeowDomains";
import AchYellow from "#/icons/ach-y.svg";
import Image from "next/image";
import formatFusdc from "@/utils/formatFusdc";
import useConnectWallet from "@/hooks/useConnectWallet";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-5">
            <div className="size-10 bg-9blueLight" />
            <div className="flex flex-col gap-1">
              <span className="font-chicago">My Portfolio Net-worth</span>
              <span className="font-chicago">$0</span>
            </div>
          </div>
          {account ? (
            <span className="self-start rounded-[3px] border border-9black bg-9gray p-1 font-geneva text-xs uppercase tracking-wide text-9black">
              {domainOrAddress}
            </span>
          ) : (
            <Button
              title="Connect your wallet"
              onClick={connect}
              className={"self-start"}
            />
          )}
        </div>
        <div className="flex items-center gap-[70px] font-chicago">
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs">Achievements</span>
            <span className="text-2xl text-9black">0</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs">Current Rank</span>
            <div className="flex items-center gap-1">
              <Image src={AchYellow} width={22} alt="Achievement" />
              <span className="text-2xl text-9black">#0</span>
            </div>
          </div>
        </div>
      </div>
      <div className="rouded-[3px] flex items-center justify-between border border-9black bg-9gray p-5 font-chicago shadow-9orderSummary">
        <div className="flex items-center gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs">My Available Cash</span>
            <span className="text-2xl">
              ${formatFusdc(Number(balance?.value) || 0)}
            </span>
          </div>
          <Button title="+ Deposit" intent={"cta"} />
        </div>

        <div className="flex gap-[70px]">
          <div className="flex flex-col gap-1">
            <span className="text-xs">PnL</span>
            <span className="text-xl text-[#808080]">Coming Soon</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs">Volume</span>
            <span className="text-xl text-[#808080]">Coming Soon</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs">Position Value</span>
            <span className="text-xl text-[#808080]">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
