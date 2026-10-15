"use client";

import { Description, DialogTitle } from "@headlessui/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { formatUnits } from "viem";
import Button from "@/components/v2/button";
import Modal from "@/components/v2/modal";
import type { RfqhubOfframpResult } from "@/providers/rfqhubGraphqlClient";

// Wallet-scoped memory survives closing/remounting, without storing secrets.
// A prepared request cannot be repeated inadvertently during this page session.
type Preparation = {
  pending?: boolean;
  result?: RfqhubOfframpResult;
  error?: string;
  uncertain?: boolean;
};
const preparations = new Map<string, Preparation>();
const emptyPreparation: Preparation = {};
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const publish = (wallet: string, state: Preparation) => {
  preparations.set(wallet, state);
  listeners.forEach((listener) => listener());
};

// The parent keys this component by wallet, isolating balance/slider sessions.
export default function WithdrawEarnings({
  accountAddress,
  requestBalance,
  offramp,
}: {
  accountAddress?: string;
  requestBalance: () => Promise<string>;
  offramp: (minAmt: string) => Promise<RfqhubOfframpResult>;
}) {
  const wallet = accountAddress?.toLowerCase() ?? "";
  const walletRef = useRef(wallet);
  walletRef.current = wallet;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const preparation = useSyncExternalStore(
    subscribe,
    () => preparations.get(wallet) ?? emptyPreparation,
    () => emptyPreparation,
  );
  const [acknowledged, setAcknowledged] = useState(false);
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
    setAcknowledged(false);
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

  // Exact micro-USDC within safe browser integers; bigint basis points above it.
  const available = balance ?? BigInt(0);
  const usePercentage = available > BigInt(Number.MAX_SAFE_INTEGER);
  const maximum = usePercentage ? "10000" : available.toString();
  const selected = usePercentage
    ? (available * BigInt(position)) / BigInt(10000)
    : BigInt(position);
  const submit = async () => {
    const previous = preparations.get(wallet);
    if (
      !wallet ||
      previous?.pending ||
      previous?.result ||
      selected <= BigInt(0) ||
      (previous?.uncertain && !acknowledged)
    )
      return;
    publish(wallet, { pending: true }); // Lock synchronously before any await.
    setAcknowledged(false);
    let sent = false;
    try {
      const fresh = await requestBalance();
      if (!mounted.current || walletRef.current !== wallet) {
        publish(wallet, {});
        return;
      }
      if (!/^\d+$/.test(fresh)) throw new Error("Invalid RFQHub balance");
      if (selected > BigInt(fresh))
        throw new Error(
          "Selected amount exceeds your current RFQHub balance. Close and reopen to refresh.",
        );
      sent = true;
      const result = await offramp(selected.toString());
      // Keep results for the originating wallet even after a switch/unmount.
      // No post-success requery can turn preparation into a failure.
      publish(wallet, { result });
    } catch (cause) {
      publish(wallet, {
        error:
          cause instanceof Error
            ? cause.message
            : "Withdrawal preparation failed",
        uncertain: sent,
      });
    }
  };

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
          Prepare withdrawal calldata from RFQHub earnings, excluding wallet
          USDC. The selected amount is a minimum in USDC; whole winning bundles
          may exceed it. This does not send an onchain transaction or complete a
          withdrawal.
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
              disabled={
                available === BigInt(0) ||
                preparation.pending ||
                !!preparation.result
              }
              aria-valuetext={`${formatUnits(selected, 6)} USDC`}
              className="w-full accent-2black"
              onChange={(event) => setPosition(event.target.value)}
            />
            <p aria-live="polite">Selected: {formatUnits(selected, 6)} USDC</p>
          </div>
        )}
        {preparation.pending ? (
          <p role="status">Preparing withdrawal…</p>
        ) : null}
        {preparation.error ? (
          <div role="alert">
            <p>Unable to prepare withdrawal: {preparation.error}</p>
            {preparation.uncertain ? (
              <label className="block">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                />{" "}
                I have checked the previous request before retrying. The server
                may already have reserved bundles; retrying may reserve more.
              </label>
            ) : null}
          </div>
        ) : null}
        {preparation.result ? (
          <div className="mt-4 space-y-2">
            <p role="status">
              Withdrawal prepared — onchain submission required. No funds have
              been withdrawn by this page.
            </p>
            <p>
              Save this calldata and these bundle IDs before leaving or
              reloading this page. Preparation may reserve bundles.
            </p>
            <label className="block">
              Prepared calldata
              <textarea
                className="w-full"
                readOnly
                value={preparation.result.cd}
              />
            </label>
            <label className="block">
              Bundle IDs
              <input
                className="w-full"
                readOnly
                value={preparation.result.ids.join(", ")}
              />
            </label>
          </div>
        ) : null}
        <Button
          title="Withdraw earnings"
          intent="reward"
          size="large"
          disabled={
            !wallet ||
            balance === undefined ||
            !!error ||
            selected <= BigInt(0) ||
            preparation.pending ||
            !!preparation.result ||
            (!!preparation.uncertain && !acknowledged)
          }
          onClick={submit}
          className="mt-6 w-full"
        />
      </Modal>
    </>
  );
}
