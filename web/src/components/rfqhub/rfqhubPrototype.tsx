"use client";

import Button from "@/components/v2/button";
import { requestEoaForAddress } from "@/providers/graphqlClient";
import RfqhubPriceChart from "./rfqhubPriceChart";
import useAssetPrices from "@/hooks/useAssetPrices";
import useRfqhub from "@/hooks/useRfqhub";
import useRfqhubRequests from "@/hooks/useRfqhubRequests";
import {
  minimumRfqhubOffer,
  type RfqhubIncomingRequest,
} from "@/lib/rfqhubRequests";
import { formatUnits, parseUnits } from "viem";
import { useEffect, useRef, useState } from "react";

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

const displayUsdc = (amount: string) => {
  try {
    return formatUnits(BigInt(amount), USDC_DECIMALS);
  } catch {
    return amount;
  }
};

const normalizeAddress = (address?: string) => {
  const hex = address?.replace(/^0x/i, "").toLowerCase();
  return hex && /^[0-9a-f]{40}$/.test(hex) ? hex : undefined;
};

const requestPriceStatus = (
  request: RfqhubIncomingRequest,
  quote: bigint | undefined,
  nowMs: number,
) => {
  // A live quote is indicative, never a settlement price after expiry.
  if (
    quote === undefined ||
    request.outcome !== "BitcoinPrice" ||
    !(Date.parse(request.expiry) > nowMs)
  )
    return undefined;
  const target = BigInt(request.priceTarget);
  if (quote === target) return "At target";
  return quote > target === request.isUp ? "Winning" : "Losing";
};

function RequestDeadlineProgress({ deadline }: { deadline: string }) {
  const [mountedAtMs] = useState(() => Date.now());
  const deadlineMs = Date.parse(deadline);
  const remainingMs = deadlineMs - mountedAtMs;

  if (!Number.isFinite(deadlineMs) || remainingMs <= 0) return null;

  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-xl bg-red-100"
    >
      <span
        data-testid="rfqhub-deadline-progress"
        className="block h-full origin-left bg-red-500 motion-reduce:animate-none"
        style={{
          animationName: "rfqhubDeadlineCountdown",
          animationDuration: `${remainingMs}ms`,
          animationTimingFunction: "linear",
          animationFillMode: "forwards",
        }}
      />
    </span>
  );
}

export default function RfqhubPrototype() {
  const { prices, connected: priceConnected } = useAssetPrices("btc");
  const latestPrice = prices[prices.length - 1]?.price;
  const livePriceRef = useRef<number | undefined>(undefined);
  livePriceRef.current = priceConnected ? latestPrice : undefined;
  const {
    accountAddress,
    requestBalance,
    requestOnchainBalance,
    createSuggestion,
    submitBundleMaker,
    concludedCalldata,
    addFunds,
  } = useRfqhub();
  const [ownerAccount, setOwnerAccount] = useState<{
    wallet: string;
    address: string;
  }>();
  useEffect(() => {
    let active = true;
    if (!accountAddress) return;
    // The feed stores GetClientAddr(factory, EOA), not the wallet EOA.
    void requestEoaForAddress(accountAddress)
      .then((address) => {
        if (active) setOwnerAccount({ wallet: accountAddress, address });
      })
      .catch(() => {
        if (active) setOwnerAccount(undefined);
      });
    return () => {
      active = false;
    };
  }, [accountAddress]);
  const ownerAddress =
    ownerAccount?.wallet === accountAddress
      ? normalizeAddress(ownerAccount?.address)
      : undefined;
  const liveQuote =
    priceConnected &&
    latestPrice !== undefined &&
    Number.isFinite(latestPrice) &&
    latestPrice > 0
      ? parseUnits(latestPrice.toFixed(USDC_DECIMALS), USDC_DECIMALS)
      : undefined;
  const requestBalanceRef = useRef(requestBalance);
  requestBalanceRef.current = requestBalance;
  const requestOnchainBalanceRef = useRef(requestOnchainBalance);
  requestOnchainBalanceRef.current = requestOnchainBalance;
  const { requests, chartRequests, connectionStatus } = useRfqhubRequests();
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [asset, setAsset] = useState("BTC");
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [duration, setDuration] = useState("5");
  const [predictionAmount, setPredictionAmount] = useState("");
  const [orders, setOrders] = useState<RfqhubOrder[]>([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRequestingCalldata, setIsRequestingCalldata] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [calldata, setCalldata] = useState<string>();

  useEffect(() => {
    setOrders(loadOrders(accountAddress));
    setSelectedOrderIndex(0);
  }, [accountAddress]);

  useEffect(() => {
    let active = true;
    setPredictionAmount("");
    if (!accountAddress) return () => undefined;

    Promise.all([
      requestBalanceRef.current(),
      requestOnchainBalanceRef.current(),
    ])
      .then(([rfqhubBalance, onchainBalance]) => {
        if (active) {
          const totalBalance = BigInt(rfqhubBalance) + BigInt(onchainBalance);
          setPredictionAmount(formatUnits(totalBalance, USDC_DECIMALS));
        }
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      });

    return () => {
      active = false;
    };
  }, [accountAddress]);

  const selectedOrder = orders[selectedOrderIndex];
  const displayedCalldata = calldata ?? selectedOrder?.calldata;

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
      const requestedAmount = parseUnits(predictionAmount, USDC_DECIMALS);
      if (livePriceRef.current === undefined)
        throw new Error("Waiting for a live BTC price");
      if (requestedAmount <= BigInt(0)) {
        throw new Error("Enter a prediction amount greater than zero");
      }

      const availableBalance = BigInt(await requestBalance());
      if (requestedAmount > availableBalance) {
        await addFunds((requestedAmount - availableBalance).toString());
      }

      const durationSeconds = Number(duration) * 60;
      const requestedReward = requestedAmount.toString();
      // Funding may take time: take the latest oracle quote at submission,
      // not the price captured when Execute was clicked. RFQ uses 6 decimals.
      const currentPrice = livePriceRef.current;
      if (currentPrice === undefined)
        throw new Error("Waiting for a live BTC price");
      const priceTarget = parseUnits(currentPrice.toFixed(6), 6).toString();
      const result = await createSuggestion({
        minAmount: requestedAmount.toString(),
        maxAmount: requestedAmount.toString(),
        isUp: direction === "up",
        priceTarget,
        durationSeconds,
        biddingWindowSeconds: durationSeconds,
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

  const submitOffer = async (request: RfqhubIncomingRequest) => {
    if (isSubmittingOffer) return;
    const assertBiddingOpen = () => {
      if (Date.parse(request.deadline) <= Date.now()) {
        throw new Error("Bidding has closed for this taker");
      }
    };

    setError(undefined);
    setIsSubmittingOffer(true);
    try {
      assertBiddingOpen();
      const amount = minimumRfqhubOffer(request);

      const availableBalance = BigInt(await requestBalance());
      assertBiddingOpen();
      if (amount > availableBalance) {
        await addFunds((amount - availableBalance).toString());
        assertBiddingOpen();
      }

      const bundleTakerId = Number(request.id);
      if (!Number.isSafeInteger(bundleTakerId)) {
        throw new Error("This taker has an invalid ID");
      }
      await submitBundleMaker({
        bundleTakerId,
        minAmount: amount.toString(),
        maxAmount: amount.toString(),
      });
      setStatus(`Offer submitted for Taker #${request.id}`);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <section className="relative left-1/2 flex w-[calc(100vw-1rem)] max-w-5xl -translate-x-1/2 flex-col gap-4 py-4 md:w-[calc(100vw-2rem)]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-4">
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
                {priceConnected && latestPrice !== undefined
                  ? "Live"
                  : "Waiting for price"}
              </span>
            </div>
            <div className="min-h-[320px] rounded-xl bg-neutral-100 px-2 pt-2">
              <RfqhubPriceChart
                prices={prices}
                requests={chartRequests ?? requests}
              />
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
              <div className="flex flex-wrap justify-end gap-2">
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
            </div>

            <div
              className="text-xl font-medium leading-[2.3] text-2black md:text-2xl"
              data-testid="prediction-sentence"
            >
              <span>I predict with $</span>
              <label className="sr-only" htmlFor="rfqhub-prediction-amount">
                Prediction amount
              </label>
              <input
                id="rfqhub-prediction-amount"
                className={`${inlineControl} w-28`}
                type="number"
                min="0"
                step="0.10"
                inputMode="decimal"
                value={predictionAmount}
                onChange={(event) => setPredictionAmount(event.target.value)}
              />
              <span>that</span>
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
                <option value="up">above</option>
                <option value="down">below</option>
              </select>
              <span>
                {" "}
                {latestPrice === undefined
                  ? "the current price (waiting for price)"
                  : `$${latestPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}{" "}
                in
              </span>
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
              <span>.</span>
            </div>

            <Button
              title={isExecuting ? "Executing…" : "Execute"}
              intent="cta"
              size="large"
              aria-label="Execute prediction"
              disabled={
                isExecuting ||
                !priceConnected ||
                latestPrice === undefined ||
                !predictionAmount ||
                !Number.isFinite(Number(predictionAmount)) ||
                Number(predictionAmount) <= 0
              }
              onClick={execute}
              className="mt-8 w-full"
            />
            {status ? (
              <p className="mt-3 text-sm font-medium text-green-700">
                {status}
              </p>
            ) : null}
            {error && !isClaimOpen ? (
              <p className="mt-3 text-sm font-medium text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-neutral-400 bg-2white p-4 lg:sticky lg:top-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Live RFQHub
              </p>
              <h2 className="text-xl font-semibold text-2black">Takers</h2>
            </div>
            <span className="flex items-center gap-2 text-xs capitalize text-neutral-500">
              <span
                className={`size-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                      ? "animate-pulse bg-yellow-500"
                      : "bg-neutral-400"
                }`}
              />
              {connectionStatus}
            </span>
          </div>

          <div
            className="flex max-h-[38rem] flex-col gap-2 overflow-y-auto"
            aria-live="polite"
          >
            {requests.length ? (
              requests.map((request) => {
                const priceStatus = requestPriceStatus(
                  request,
                  liveQuote,
                  nowMs,
                );
                const isOwner =
                  !!ownerAddress &&
                  normalizeAddress(request.accountAddress) === ownerAddress;
                const background =
                  priceStatus === "Winning"
                    ? "bg-green-50 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.16),transparent)] hover:bg-green-50"
                    : priceStatus === "Losing"
                      ? "bg-red-50 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.14),transparent)] hover:bg-red-50"
                      : "bg-neutral-100 hover:bg-neutral-200";
                return (
                  <button
                    type="button"
                    key={`${request.id}:${request.matchVersion ?? 0}`}
                    data-testid="rfqhub-request"
                    aria-label={`Offer minimum for Taker #${request.id}`}
                    disabled={isSubmittingOffer}
                    aria-describedby={`rfqhub-request-status-${request.id}`}
                    className={`relative w-full overflow-hidden rounded-xl border p-3 text-left text-sm text-2black transition focus:outline-none focus:ring-2 focus:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-60 ${background} ${isOwner ? "border-yellow-400 shadow-[inset_0_0_10px_rgba(234,179,8,0.25)] hover:border-yellow-400" : "border-neutral-300 hover:border-neutral-500"}`}
                    style={
                      request.matchVersion
                        ? {
                            animationName: "rfqhubMakerMatchFlash",
                            animationDuration: "900ms",
                            animationTimingFunction: "ease-out",
                          }
                        : undefined
                    }
                    onClick={() => void submitOffer(request)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong>Taker #{request.id}</strong>
                      <span className="rounded-full bg-2black px-2 py-0.5 text-xs font-medium text-2white">
                        {request.isUp ? "Up" : "Down"}
                      </span>
                    </div>
                    <span
                      id={`rfqhub-request-status-${request.id}`}
                      className="mt-2 flex gap-2 text-xs font-medium"
                    >
                      {priceStatus && <span>{priceStatus} · live price</span>}
                      {isOwner && (
                        <span className="text-yellow-800">Yours</span>
                      )}
                    </span>
                    <div className="mt-2 flex items-center justify-between gap-3 text-neutral-600">
                      <span>Amount</span>
                      <span className="font-medium text-2black">
                        ${displayUsdc(request.amount)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-neutral-600">
                      <span>Minimum offer (estimated)</span>
                      <span className="font-medium text-2black">
                        $
                        {displayUsdc(
                          minimumRfqhubOffer(request, nowMs).toString(),
                        )}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-neutral-600">
                      <span>Target</span>
                      <span className="font-medium text-2black">
                        ${displayUsdc(request.priceTarget)}
                      </span>
                    </div>
                    <p className="mt-2 truncate text-xs text-neutral-500">
                      {request.outcome}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Bidding closes{" "}
                      <time dateTime={request.deadline}>
                        {new Date(request.deadline).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </p>
                    <p className="mt-3 text-xs font-semibold text-2black">
                      Offer minimum →
                    </p>
                    <RequestDeadlineProgress
                      key={request.deadline}
                      deadline={request.deadline}
                    />
                  </button>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
                Waiting for taker advertisements…
              </p>
            )}
          </div>
        </aside>
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
