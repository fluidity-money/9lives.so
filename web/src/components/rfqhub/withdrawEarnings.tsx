"use client";

import { Description, DialogTitle } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { formatUnits } from "viem";
import Button from "@/components/v2/button";
import Modal from "@/components/v2/modal";

// Mount with a wallet key so a wallet change/disconnect discards the entire session.
export default function WithdrawEarnings({
  accountAddress,
  requestBalance,
}: {
  accountAddress?: string;
  requestBalance: () => Promise<string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [balance, setBalance] = useState<bigint>();
  const [error, setError] = useState<string>();
  const [position, setPosition] = useState("0");
  const requestRef = useRef(requestBalance);
  requestRef.current = requestBalance;

  useEffect(() => {
    let active = true;
    setBalance(undefined);
    setError(undefined);
    setPosition("0");
    if (!isOpen || !accountAddress) return;
    void (async () => {
      try {
        const result = await requestRef.current();
        if (!/^\d+$/.test(result)) throw new Error("Invalid RFQHub balance");
        if (active) setBalance(BigInt(result));
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Balance request failed",
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [isOpen, accountAddress, attempt]);

  // Use exact micro-USDC steps within the browser's safe integer range. For
  // larger balances use basis-point steps and bigint arithmetic, including max.
  const available = balance ?? BigInt(0);
  const usePercentage = available > BigInt(Number.MAX_SAFE_INTEGER);
  const maximum = usePercentage ? "10000" : available.toString();
  const selected = usePercentage
    ? (available * BigInt(position)) / BigInt(10000)
    : BigInt(position);

  return (
    <>
      <Button
        title="Withdraw earnings"
        intent="reward"
        size="small"
        onClick={() => setIsOpen(true)}
      />
      <Modal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        displayClose={false}
        boxContainerClass="mx-4 max-w-md"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <DialogTitle className="text-2xl font-semibold text-2black">
            Withdraw earnings
          </DialogTitle>
          <button
            type="button"
            data-autofocus
            aria-label="Close withdraw earnings"
            className="rounded-full px-3 py-1 text-xl text-neutral-500 focus-visible:outline"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>
        <Description className="mb-6 text-sm text-neutral-500">
          Withdrawals are coming soon. The withdrawal API is still being
          finalized; no withdrawal will be submitted. Only your RFQHub balance
          is available here, excluding wallet USDC.
        </Description>
        {!accountAddress ? (
          <p role="status">Connect your wallet to view your RFQHub balance.</p>
        ) : error ? (
          <div>
            <p role="alert">Unable to load RFQHub balance: {error}</p>
            <Button
              title="Retry balance"
              onClick={() => setAttempt((value) => value + 1)}
            />
          </div>
        ) : balance === undefined ? (
          <p role="status">Loading RFQHub balance…</p>
        ) : (
          <div className="space-y-4 text-sm text-2black">
            <p>Available RFQHub balance: {formatUnits(available, 6)} USDC</p>
            {available === BigInt(0) ? (
              <p role="status">No RFQHub balance is available to withdraw.</p>
            ) : null}
            <label className="block" htmlFor="rfqhub-withdraw-amount">
              Withdrawal amount
            </label>
            <input
              id="rfqhub-withdraw-amount"
              type="range"
              min="0"
              max={maximum}
              step="1"
              value={position}
              disabled={available === BigInt(0)}
              aria-valuetext={`${formatUnits(selected, 6)} USDC`}
              className="w-full accent-2black"
              onChange={(event) => setPosition(event.target.value)}
            />
            <p aria-live="polite">Selected: {formatUnits(selected, 6)} USDC</p>
          </div>
        )}
        <Button
          title="Withdraw earnings"
          intent="reward"
          size="large"
          disabled
          className="mt-6 w-full"
        />
      </Modal>
    </>
  );
}
