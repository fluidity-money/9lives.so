"use client";

import Link from "next/link";
import Image from "next/image";
import { useAppKitAccount } from "@reown/appkit/react";
import useAcitivies from "@/hooks/useActivities";
import formatFusdc from "@/utils/format/formatUsdc";
import { calcTimePassed } from "@/utils/calcTimeDiff";
import { combineClass } from "@/utils/combineClass";
import config from "@/config";
import { Activity } from "@/types";
import Button from "../button";

export default function ActivityTab() {
  const account = useAppKitAccount();
  const {
    data: activities,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAcitivies({ address: account?.address });
  const data = activities?.pages.flatMap((c) => c);

  if (isLoading) return <SkeletonList />;
  if (isError)
    return (
      <PlaceholderCard
        title="Whoops, error!"
        subtitle={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  if (data?.length === 0)
    return (
      <PlaceholderCard
        title="Nothing yet."
        subtitle="Start Growing Your Portfolio."
      />
    );

  return (
    <div className="flex flex-col gap-[8px]">
      {data?.map((item, idx) => (
        <ActivityRow key={idx} data={item} />
      ))}

      <div className="flex items-center justify-center py-[8px]">
        {hasNextPage ? (
          <Button
            intent="cta"
            size="small"
            disabled={isFetchingNextPage}
            title={isFetchingNextPage ? "Loading..." : "Show More"}
            onClick={() => fetchNextPage()}
          />
        ) : data && data.length > 0 ? (
          <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
            End of results
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ActivityRow({ data }: { data: Activity }) {
  const pricePerShare =
    data.type === "buy"
      ? data.fromAmount / data.toAmount
      : data.toAmount / data.fromAmount;
  const qty = formatFusdc(
    data.type === "buy" ? data.toAmount : data.fromAmount,
    2,
  );
  const cost = formatFusdc(
    data.type === "buy" ? data.fromAmount : data.toAmount,
    2,
  );
  const isBuy = data.type === "buy";
  const isYes = data.outcomeName === "Yes";
  const isNo = data.outcomeName === "No";

  return (
    <div className="relative rounded-[12px] bg-[#fdfdfd] hover:bg-[#fafafa] transition-colors">
      <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
      <div className="relative flex items-center gap-[12px] p-[12px]">
        {/* Outcome pic */}
        {data?.outcomePic ? (
          <Image
            src={data.outcomePic}
            alt={data.campaignName}
            width={40}
            height={40}
            className="size-[40px] rounded-[8px] object-cover flex-shrink-0"
          />
        ) : null}

        {/* Info */}
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <Link
            href={`/campaign/${data.campaignId}`}
            className="font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e] hover:underline truncate"
          >
            {data.campaignName}
          </Link>
          <div className="flex items-center gap-[6px]">
            <span
              className={combineClass(
                "font-dmMono text-[10px] uppercase px-[6px] py-[1px] rounded-[4px]",
                isYes
                  ? "bg-green-50 text-green-600"
                  : isNo
                    ? "bg-red-50 text-red-600"
                    : "bg-neutral-100 text-neutral-500",
              )}
            >
              {data.outcomeName}
            </span>
            <Link
              href={`${config.destinationChain.blockExplorers.default.url}/tx/${data.txHash}`}
              target="_blank"
              className="font-dmMono text-[11px] text-[#737373] hover:underline"
            >
              {data.txHash.slice(0, 6)}...{data.txHash.slice(-4)}
            </Link>
          </div>
        </div>

        {/* Type badge */}
        <span
          className={combineClass(
            "font-dmMono text-[10px] uppercase px-[6px] py-[2px] rounded-[4px] flex-shrink-0",
            isBuy ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
          )}
        >
          {data.type}
        </span>

        {/* Price */}
        <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
          <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
            Price
          </span>
          <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
            ${pricePerShare.toFixed(2)}
          </span>
        </div>

        {/* Qty */}
        <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
          <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
            Qty
          </span>
          <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
            {qty}
          </span>
        </div>

        {/* Cost */}
        <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
          <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
            Cost
          </span>
          <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
            ${cost}
          </span>
        </div>

        {/* Time */}
        <div className="flex flex-col items-end gap-[2px] flex-shrink-0 min-w-[50px]">
          <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
            Time
          </span>
          <span className="font-overusedGrotesk text-[13px] text-[#0e0e0e]">
            {calcTimePassed(data.createdAt * 1000).text}
          </span>
        </div>
      </div>
    </div>
  );
}

function PlaceholderCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-[8px] py-[40px] rounded-[12px] border border-[#e5e5e5] bg-[#fdfdfd]">
      <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
        {title}
      </span>
      {subtitle && (
        <span className="font-dmMono text-[11px] text-[#737373]">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-[8px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[12px] border border-[#e5e5e5] bg-[#fdfdfd] p-[12px]"
        >
          <div className="flex items-center gap-[12px]">
            <div className="size-[40px] rounded-[8px] bg-neutral-200" />
            <div className="flex flex-col gap-[6px] flex-1">
              <div className="h-[14px] w-[120px] rounded bg-neutral-200" />
              <div className="h-[10px] w-[60px] rounded bg-neutral-100" />
            </div>
            <div className="h-[14px] w-[40px] rounded bg-neutral-200" />
            <div className="h-[14px] w-[50px] rounded bg-neutral-200" />
            <div className="h-[14px] w-[50px] rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
