"use client";

import use9LivesPoints from "@/hooks/use9LivesPoints";
import useBalance from "@/hooks/useBalance";
import useConnectWallet from "@/hooks/useConnectWallet";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import useMeowDomains from "@/hooks/useMeowDomains";
import useTotalPnL from "@/hooks/useTotalPnL";
import useTotalVolume from "@/hooks/useTotalVolume";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { EVENTS, track } from "@/utils/analytics";
import { combineClass } from "@/utils/combineClass";
import formatFusdc from "@/utils/format/formatUsdc";
import { useAppKitAccount } from "@reown/appkit/react";
import Link from "next/link";
import { useState } from "react";
import WithdrawDialog from "../withdrawDialog";
import Button from "../v2/button";
import SimpleClaimAllButton from "../v2/claimAllButton";
import Modal from "../v2/modal";

function Badge({ address }: { address: string }) {
  const { data: domainOrAddress } = useMeowDomains(address);

  return (
    <span className="inline-flex max-w-full self-start truncate rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600">
      {domainOrAddress}
    </span>
  );
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-neutral-400">{label}</span>
      <span
        className={combineClass(
          "truncate text-lg font-semibold text-2black",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default function PortfolioHeader() {
  const account = useAppKitAccount();
  const { data: balance } = useBalance(account.address);
  const { connect } = useConnectWallet();
  const positionsValue = usePortfolioStore((state) => state.positionsValue);
  const unrealizedPnL = usePortfolioStore((state) => state.totalPnL);
  const { data: pnl } = useTotalPnL(account.address);
  const realizedPnL = Number(formatFusdc(pnl?.totalPnl ?? "0", 2));
  const { data: totalVolume } = useTotalVolume(account.address);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const enableWithdraw = useFeatureFlag("enable paymaster withdraw");
  const totalPnL = unrealizedPnL + realizedPnL;
  const cash = Number(formatFusdc(balance ?? 0, 2));
  const netWorth = cash + (positionsValue || 0);
  const { data: points } = use9LivesPoints({
    address: account.address,
    enabled: !!account.address,
  });

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-lg font-bold text-neutral-500">
              9L
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-neutral-400">
                Portfolio net worth
              </span>
              <span className="text-2xl font-bold tracking-tight text-2black">
                ${netWorth.toFixed(2)}
              </span>
              {account.address ? (
                <Badge address={account.address} />
              ) : (
                <Button
                  title="Connect your wallet"
                  intent="inverted"
                  size="small"
                  onClick={() => connect()}
                  className="self-start"
                />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-100 px-4 py-3 sm:flex-col sm:items-end">
            <span className="text-xs font-medium text-neutral-400">
              Current rank
            </span>
            <span className="text-xl font-bold text-2black">
              {points?.[0]?.rank ? `#${points[0].rank}` : "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-neutral-200 sm:grid-cols-4">
          <div className="bg-neutral-50 p-4">
            <Metric label="Available cash" value={`$${cash.toFixed(2)}`} />
          </div>
          <div className="bg-neutral-50 p-4">
            <Metric
              label="PnL"
              value={`${totalPnL >= 0 ? "+" : "−"}$${Math.abs(totalPnL).toFixed(2)}`}
              valueClassName={totalPnL >= 0 ? "text-green-600" : "text-red-600"}
            />
          </div>
          <div className="bg-neutral-50 p-4">
            <Metric
              label="Volume"
              value={`$${formatFusdc(totalVolume ?? 0, 2)}`}
            />
          </div>
          <div className="bg-neutral-50 p-4">
            <Metric
              label="Position value"
              value={`$${(positionsValue ?? 0).toFixed(2)}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 p-3">
          <Link
            href="https://bridge.superposition.so/"
            target="_blank"
            rel="noreferrer"
            onClick={() => track(EVENTS.FUNDING_CLICKED, { type: "portfolio" })}
          >
            <Button title="Deposit" />
          </Link>
          {enableWithdraw ? (
            <Button
              title="Withdraw"
              intent="inverted"
              onClick={() => setIsWithdrawDialogOpen(true)}
            />
          ) : null}
          <SimpleClaimAllButton />
        </div>
      </div>

      <Modal
        isOpen={isWithdrawDialogOpen}
        setIsOpen={setIsWithdrawDialogOpen}
        boxContainerClass="max-w-xl"
      >
        <div className="pr-8">
          <h2 className="mb-4 text-xl font-semibold text-2black">
            Withdraw assets
          </h2>
          <WithdrawDialog />
        </div>
      </Modal>
    </>
  );
}
