"use client";

import PriceChartWrapper from "@/components/v2/chartWrapper";
import useRfqhub from "@/hooks/useRfqhub";
import type { SimpleCampaignDetail } from "@/types";
import { useState } from "react";

const inlineControl =
  "mx-1 inline-flex rounded-md border border-black bg-white px-2 py-1 font-chicago text-[0.8em] leading-none shadow-[2px_2px_0_rgba(0,0,0,0.16)] outline-none transition hover:bg-9blueLight focus:ring-2 focus:ring-black focus:ring-offset-2";

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
    <section className="flex min-h-[calc(100vh-180px)] items-center py-6 md:py-12">
      <div className="grid w-full overflow-hidden rounded-lg border-2 border-black bg-[#f5f5f5] shadow-[8px_8px_0_rgba(0,0,0,0.16)] lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="border-b-2 border-black bg-white p-4 lg:border-b-0 lg:border-r-2 lg:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-geneva text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                Live oracle price
              </p>
              <h2 className="font-chicago text-xl">BTC / USD</h2>
            </div>
            <span className="flex items-center gap-2 font-geneva text-[10px] uppercase tracking-wider text-neutral-600">
              <span className="size-2 animate-pulse rounded-full bg-green-500" />
              Live
            </span>
          </div>
          <div className="min-h-[320px] rounded-md border border-neutral-300 bg-2white px-2 pt-2">
            <PriceChartWrapper simple campaignData={campaignData} />
          </div>
        </div>

        <div className="flex flex-col justify-center bg-9blueLight/40 p-6 md:p-10 lg:p-12">
          <p className="mb-3 font-geneva text-[10px] uppercase tracking-[0.2em] text-neutral-600">
            RFQHub prototype
          </p>
          <h1 className="mb-8 font-chicago text-2xl leading-tight md:text-3xl">
            Make a prediction
          </h1>

          <div className="font-chicago text-2xl leading-[2.15] text-neutral-900 md:text-[2rem]">
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

          <button
            type="button"
            aria-label="Execute prediction"
            disabled
            className="mt-10 w-full rounded-md border-2 border-black bg-black px-5 py-4 font-chicago text-base text-white opacity-50 shadow-[4px_4px_0_rgba(0,0,0,0.18)]"
          >
            Execute
          </button>
          <p className="mt-3 text-center font-geneva text-[10px] uppercase tracking-wider text-neutral-500">
            Execution is coming next
          </p>
        </div>
      </div>
    </section>
  );
}
