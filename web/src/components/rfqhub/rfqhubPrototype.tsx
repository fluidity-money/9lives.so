"use client";

import Button from "@/components/v2/button";
import PriceChartWrapper from "@/components/v2/chartWrapper";
import useRfqhub from "@/hooks/useRfqhub";
import type { SimpleCampaignDetail } from "@/types";
import { formatUnits, parseUnits } from "viem";
import { useEffect, useMemo, useState } from "react";

const inlineControl =
  "mx-1 inline-flex rounded-xl border border-neutral-300 bg-neutral-100 px-2 py-1 text-[0.8em] leading-none text-2black outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-300";
const USDC_DECIMALS = 6;
const RFQHUB_ORDERS_KEY = "rfqhub-taker-orders";

type RfqhubOrder = {
  bundleId: number;
  amountSpent: string;
  requestedReward: string;
  direction: "up" | "down";
  expiryMs: number;
  calldata?: string;
};

const storageKey = (address?: string) =>
  `${RFQHUB_ORDERS_KEY}:${address?.toLowerCase() ?? "disconnected"}`;

const loadOrders = (address?: string): RfqhubOrder[] => {
  try {
    const value = window.localStorage.getItem(storageKey(address));
    if (!value) return [];
    const orders = JSON.parse(value) as unknown;
    if (!Array.isArray(orders)) return [];
    return orders.filter(
      (order): order is RfqhubOrder =>
        typeof order === "object" &&
        order !== null &&
        Number.isInteger((order as RfqhubOrder).bundleId) &&
        typeof (order as RfqhubOrder).amountSpent === "string" &&
        typeof (order as RfqhubOrder).requestedReward === "string" &&
        ["up", "down"].includes((order as RfqhubOrder).direction) &&
        typeof (order as RfqhubOrder).expiryMs === "number" &&
        (typeof (order as RfqhubOrder).calldata === "undefined" ||
          typeof (order as RfqhubOrder).calldata === "string"),
    );
  } catch {
    return [];
  }
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "RFQHub request failed";

export default function RfqhubPrototype({
  campaignData,
}: {
  campaignData: SimpleCampaignDetail;
}) {
  const {
    accountAddress,
    requestBalance,
    createSuggestion,
    concludedCalldata,
  } = useRfqhub();

  const [asset, setAsset] = useState("BTC");
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [duration, setDuration] = useState("5");
  const [amount, setAmount] = useState(100);
  const [orders, setOrders] = useState<RfqhubOrder[]>([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRequestingCalldata, setIsRequestingCalldata] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [calldata, setCalldata] = useState<string>();

  useEffect(() => {
    setOrders(loadOrders(accountAddress));
    setSelectedOrderIndex(0);
  }, [accountAddress]);

  const selectedOrder = orders[selectedOrderIndex];
  const displayedCalldata = calldata ?? selectedOrder?.calldata;
  const priceTarget = useMemo(
    () =>
      parseUnits(
        campaignData.priceMetadata.priceTargetForUp,
        USDC_DECIMALS,
      ).toString(),
    [campaignData.priceMetadata.priceTargetForUp],
  );

  const saveOrders = (nextOrders: RfqhubOrder[]) => {
    setOrders(nextOrders);
    window.localStorage.setItem(
      storageKey(accountAddress),
      JSON.stringify(nextOrders),
    );
  };

  const execute = async () => {
    setError(undefined);
    setStatus(undefined);
    setCalldata(undefined);
    setIsExecuting(true);
    try {
      const rolledUpBalance = BigInt(await requestBalance());
      if (rolledUpBalance <= BigInt(0)) {
        throw new Error(
          "No RFQHub balance is available. Fund your account before executing.",
        );
      }

      const durationSeconds = Number(duration) * 60;
      const requestedReward = parseUnits(
        amount.toString(),
        USDC_DECIMALS,
      ).toString();
      const result = await createSuggestion({
        minAmount: rolledUpBalance.toString(),
        maxAmount: rolledUpBalance.toString(),
        isUp: direction === "up",
        priceTarget,
        durationSeconds,
        biddingWindowSeconds: Math.min(60, durationSeconds - 1),
        minOffer: requestedReward,
      });
      const order: RfqhubOrder = {
        bundleId: result.bundleId,
        amountSpent: result.amountSpent,
        requestedReward,
        direction,
        expiryMs: Date.now() + durationSeconds * 1000,
      };
      const nextOrders = [
        ...orders.filter((x) => x.bundleId !== order.bundleId),
        order,
      ];
      saveOrders(nextOrders);
      setSelectedOrderIndex(nextOrders.length - 1);
      setStatus(`Prediction #${result.bundleId} is open`);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setIsExecuting(false);
    }
  };

  const requestClaimCalldata = async () => {
    if (!selectedOrder) return;
    setError(undefined);
    setCalldata(undefined);
    setIsRequestingCalldata(true);
    try {
      const result = await concludedCalldata(selectedOrder.bundleId, true);
      setCalldata(result);
      saveOrders(
        orders.map((order) =>
          order.bundleId === selectedOrder.bundleId
            ? { ...order, calldata: result }
            : order,
        ),
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setIsRequestingCalldata(false);
    }
  };

  return (
    <section className="flex w-full flex-col gap-4 py-4">
      <div className="rounded-xl border border-neutral-400 bg-2white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Live oracle price
            </p>
            <h2 className="text-xl font-semibold text-2black">BTC / USD</h2>
          </div>
          <span className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span className="size-2 animate-pulse rounded-full bg-green-500" />
            Live
          </span>
        </div>
        <div className="min-h-[320px] rounded-xl bg-neutral-100 px-2 pt-2">
          <PriceChartWrapper simple campaignData={campaignData} />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-400 bg-2white p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
              Rfqhub
            </p>
            <h1 className="mb-6 text-2xl font-semibold leading-tight text-2black md:text-3xl">
              Make a prediction
            </h1>
          </div>
          <Button
            title="Claim rewards"
            intent="reward"
            size="small"
            onClick={() => {
              setError(undefined);
              setIsClaimOpen(true);
            }}
          />
        </div>

        <div className="text-xl font-medium leading-[2.3] text-2black md:text-2xl">
          <span>I predict that</span>
          <label className="sr-only" htmlFor="rfqhub-asset">
            Asset
          </label>
          <select
            id="rfqhub-asset"
            className={inlineControl}
            value={asset}
            onChange={(event) => setAsset(event.target.value)}
          >
            <option value="BTC">BTC</option>
          </select>
          <span>will be</span>
          <label className="sr-only" htmlFor="rfqhub-direction">
            Direction
          </label>
          <select
            id="rfqhub-direction"
            className={inlineControl}
            value={direction}
            onChange={(event) =>
              setDirection(event.target.value as "up" | "down")
            }
          >
            <option value="up">up</option>
            <option value="down">down</option>
          </select>
          <span>by</span>
          <label className="sr-only" htmlFor="rfqhub-duration">
            Duration
          </label>
          <select
            id="rfqhub-duration"
            className={inlineControl}
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          >
            <option value="5">5 mins</option>
            <option value="15">15 mins</option>
          </select>
          <span>, and I want $</span>
          <label className="sr-only" htmlFor="rfqhub-amount">
            Winnings amount
          </label>
          <input
            id="rfqhub-amount"
            className={`${inlineControl} w-24`}
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.valueAsNumber || 0)}
          />
          <span>if I win.</span>
        </div>

        <Button
          title={isExecuting ? "Executing…" : "Execute"}
          intent="cta"
          size="large"
          aria-label="Execute prediction"
          disabled={isExecuting || !Number.isFinite(amount) || amount <= 0}
          onClick={execute}
          className="mt-8 w-full"
        />
        {status ? (
          <p className="mt-3 text-sm font-medium text-green-700">{status}</p>
        ) : null}
        {error && !isClaimOpen ? (
          <p className="mt-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {isClaimOpen ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-2black/20"
          role="dialog"
          aria-label="Claim rewards"
          aria-modal="true"
        >
          <button
            className="grow cursor-default"
            aria-label="Close claim rewards"
            onClick={() => setIsClaimOpen(false)}
          />
          <aside className="flex size-full max-w-md flex-col border-l border-neutral-300 bg-2white p-6 shadow-xl">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  RFQHub
                </p>
                <h2 className="text-2xl font-semibold text-2black">
                  Claim rewards
                </h2>
              </div>
              <button
                className="rounded-full px-3 py-1 text-xl text-neutral-500"
                aria-label="Close claim rewards"
                onClick={() => setIsClaimOpen(false)}
              >
                ×
              </button>
            </div>

            {selectedOrder ? (
              <>
                <label
                  className="mb-2 text-sm font-medium text-2black"
                  htmlFor="rfqhub-reward-slider"
                >
                  Reward to collect
                </label>
                <input
                  id="rfqhub-reward-slider"
                  aria-label="Reward to collect"
                  type="range"
                  min="0"
                  max={Math.max(orders.length - 1, 0)}
                  step="1"
                  value={selectedOrderIndex}
                  onChange={(event) => {
                    setCalldata(undefined);
                    setSelectedOrderIndex(event.target.valueAsNumber);
                  }}
                  className="w-full accent-2black"
                />
                <div className="mt-6 rounded-xl border border-neutral-300 bg-neutral-100 p-4 text-sm text-2black">
                  <div className="flex justify-between">
                    <span>Prediction</span>
                    <strong>#{selectedOrder.bundleId}</strong>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>Position</span>
                    <strong className="capitalize">
                      {selectedOrder.direction}
                    </strong>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>Requested reward</span>
                    <strong>
                      $
                      {formatUnits(
                        BigInt(selectedOrder.requestedReward),
                        USDC_DECIMALS,
                      )}
                    </strong>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span>Expires</span>
                    <strong>
                      {new Date(selectedOrder.expiryMs).toLocaleString()}
                    </strong>
                  </div>
                </div>
                <Button
                  title={
                    isRequestingCalldata ? "Requesting…" : "Request calldata"
                  }
                  intent="reward"
                  size="large"
                  disabled={
                    isRequestingCalldata || Boolean(selectedOrder.calldata)
                  }
                  onClick={requestClaimCalldata}
                  className="mt-6 w-full"
                />
              </>
            ) : (
              <p className="text-sm text-neutral-500">
                No locally tracked RFQHub rewards are available.
              </p>
            )}

            {error ? (
              <p className="mt-3 text-sm font-medium text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            {displayedCalldata ? (
              <div className="mt-6">
                <label
                  className="mb-2 block text-sm font-medium text-2black"
                  htmlFor="rfqhub-claim-calldata"
                >
                  Claim calldata
                </label>
                <textarea
                  id="rfqhub-claim-calldata"
                  aria-label="Claim calldata"
                  readOnly
                  value={displayedCalldata}
                  rows={6}
                  className="w-full break-all rounded-xl border border-neutral-300 bg-neutral-100 p-3 font-mono text-xs text-2black"
                />
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  );
}
