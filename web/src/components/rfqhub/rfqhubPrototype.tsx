"use client";

import PriceChartWrapper from "@/components/v2/chartWrapper";
import Button from "@/components/v2/button";
import useRfqhub from "@/hooks/useRfqhub";
import type { SimpleCampaignDetail } from "@/types";
import { useState } from "react";

const inlineControl =
  "mx-1 inline-flex rounded-xl border border-neutral-300 bg-neutral-100 px-2 py-1 text-[0.8em] leading-none text-2black outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-300";

export default function RfqhubPrototype({
  campaignData,
}: {
  campaignData: SimpleCampaignDetail;
}) {
  useRfqhub();

  const [asset, setAsset] = useState("BTC");
  const [direction, setDirection] = useState("up");
  const [duration, setDuration] = useState("5");
  const [amount, setAmount] = useState(100);

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
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
          Rfqhub
        </p>
        <h1 className="mb-6 text-2xl font-semibold leading-tight text-2black md:text-3xl">
          Make a prediction
        </h1>

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
            onChange={(event) => setDirection(event.target.value)}
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
          title="Execute"
          intent="cta"
          size="large"
          aria-label="Execute prediction"
          disabled
          className="mt-8 w-full"
        />
      </div>
    </section>
  );
}
