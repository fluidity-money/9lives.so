"use client";

import Link from "next/link";
import Image from "next/image";
import { useAppKitAccount } from "@reown/appkit/react";
import useClaimedRewards from "@/hooks/useClaimedRewards";
import formatFusdc from "@/utils/format/formatUsdc";
import { calcTimePassed } from "@/utils/calcTimeDiff";
import { combineClass } from "@/utils/combineClass";
import { ClaimedCampaign } from "@/types";
import Button from "../button";

export default function ClaimedRewardsTab() {
  const account = useAppKitAccount();
  const {
    isLoading,
    isError,
    error,
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useClaimedRewards(account?.address);

  const claimedRewards = data?.pages?.flatMap((p) => p);

  if (isLoading) return <SkeletonList />;
  if (isError)
    return (
      <PlaceholderCard
        title="Whoops, error!"
        subtitle={error.message}
      />
    );
  if (claimedRewards?.length === 0)
    return (
      <PlaceholderCard
        title="No Rewards Yet."
        subtitle="Start Growing Your Portfolio."
      />
    );

  return (
    <div className="flex flex-col gap-[8px]">
      {claimedRewards?.map((item) => (
        <ClaimedRewardRow key={item.txHash + item.winner} data={item} />
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
        ) : claimedRewards && claimedRewards.length > 0 ? (
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
            End of results
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ClaimedRewardRow({ data }: { data: ClaimedCampaign }) {
  if (!data) return null;

  const winnerOutcome = data.content.outcomes.find(
    (o) => o.identifier === data.winner,
  )!;
  const isYes = winnerOutcome?.name === "Yes";
  const isNo = winnerOutcome?.name === "No";
  const pnlValue = data.pnl ? Number(data.pnl) : null;
  const isPositivePnl = pnlValue !== null && pnlValue > 0;

  return (
    <div className="relative rounded-[12px] bg-[#fdfdfd] hover:bg-[#fafafa] transition-colors">
      <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
      <div className="relative flex items-center gap-[12px] p-[12px]">
        {/* Campaign pic */}
        {data.content.picture ? (
          <Image
            src={data.content.picture}
            alt={data.content.name}
            width={40}
            height={40}
            className="size-[40px] rounded-[8px] object-cover flex-shrink-0"
          />
        ) : null}

        {/* Info */}
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <Link
            href={`/campaign/${data.content.identifier}`}
            className="font-overusedGrotesk font-semibold text-[13px] text-[#0e0e0e] hover:underline truncate"
          >
            {data.content.name}
          </Link>
          <Link
            target="_blank"
            href={`https://explorer.superposition.so/tx/${data.txHash}`}
            className="font-dmMono text-[9px] text-[#a3a3a3] hover:underline"
          >
            Tx: {data.txHash.slice(0, 6)}...{data.txHash.slice(-4)}
          </Link>
        </div>

        {/* Winner */}
        <div className="flex items-center gap-[6px] flex-shrink-0">
          {winnerOutcome?.picture ? (
            <Image
              src={winnerOutcome.picture}
              alt={winnerOutcome.name}
              width={24}
              height={24}
              className="size-[24px] rounded-[6px] object-cover"
            />
          ) : null}
          <span
            className={combineClass(
              "font-dmMono text-[9px] uppercase px-[4px] py-[1px] rounded-[4px]",
              isYes
                ? "bg-green-50 text-green-600"
                : isNo
                  ? "bg-red-50 text-red-600"
                  : "bg-neutral-100 text-neutral-500",
            )}
          >
            {winnerOutcome?.name}
          </span>
        </div>

        {/* Reward amount */}
        <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
            Reward
          </span>
          <div className="flex items-center gap-[6px]">
            <span className="font-overusedGrotesk font-bold text-[14px] text-[#0e0e0e]">
              ${formatFusdc(+data.fusdcReceived, 2)}
            </span>
            {pnlValue !== null ? (
              <span
                className={combineClass(
                  "font-dmMono text-[9px] uppercase px-[4px] py-[1px] rounded-[4px]",
                  isPositivePnl
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600",
                )}
              >
                ${formatFusdc(BigInt(data.pnl!), 2)}
              </span>
            ) : (
              <span className="font-dmMono text-[9px] uppercase px-[4px] py-[1px] rounded-[4px] bg-red-50 text-red-600">
                Refund
              </span>
            )}
          </div>
        </div>

        {/* Shares spent */}
        <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
            Shares
          </span>
          <span className="font-overusedGrotesk text-[12px] text-[#0e0e0e]">
            {formatFusdc(+data.sharesSpent, 2)}{" "}
            <span
              className={combineClass(
                "font-dmMono text-[9px] px-[3px] py-[1px] rounded-[3px]",
                isYes
                  ? "bg-green-50 text-green-600"
                  : isNo
                    ? "bg-red-50 text-red-600"
                    : "bg-neutral-100 text-neutral-500",
              )}
            >
              {winnerOutcome?.name}
            </span>
          </span>
        </div>

        {/* Date */}
        <div
          className="flex flex-col items-end gap-[2px] flex-shrink-0 min-w-[50px]"
          title={new Date(data.createdAt * 1000).toISOString()}
        >
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
            Date
          </span>
          <span className="font-overusedGrotesk text-[12px] text-[#0e0e0e]">
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
        <span className="font-dmMono text-[11px] text-[#a3a3a3]">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-[8px]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[12px] border border-[#e5e5e5] bg-[#fdfdfd] p-[12px]"
        >
          <div className="flex items-center gap-[12px]">
            <div className="size-[40px] rounded-[8px] bg-neutral-200" />
            <div className="flex flex-col gap-[6px] flex-1">
              <div className="h-[14px] w-[140px] rounded bg-neutral-200" />
              <div className="h-[10px] w-[80px] rounded bg-neutral-100" />
            </div>
            <div className="h-[14px] w-[60px] rounded bg-neutral-200" />
            <div className="h-[14px] w-[50px] rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
