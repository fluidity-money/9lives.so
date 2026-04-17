"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppKitAccount } from "@reown/appkit/react";
import useUserLPs from "@/hooks/useUserLPs";
import useLiquidity from "@/hooks/useLiquidity";
import formatFusdc from "@/utils/format/formatUsdc";
import { requestUserLPs } from "@/providers/graphqlClient";
import Button from "../button";

export default function LpCampaignsTab() {
  const account = useAppKitAccount();
  const {
    data: campaigns,
    isError,
    error,
    isLoading,
  } = useUserLPs(account?.address);

  if (isLoading) return <SkeletonList />;
  if (isError)
    return (
      <PlaceholderCard
        title="Whoops, error!"
        subtitle={error.message}
      />
    );
  if (campaigns?.length === 0)
    return (
      <PlaceholderCard
        title="Nothing yet."
        subtitle="Start Growing Your Portfolio."
      />
    );

  return (
    <div className="flex flex-col gap-[8px]">
      {campaigns?.map((data) => (
        <LpCampaignRow key={data.campaign?.identifier} data={data} />
      ))}
    </div>
  );
}

function LpCampaignRow({
  data: { campaign: data, liquidity },
}: {
  data: NonNullable<Awaited<ReturnType<typeof requestUserLPs>>[number]>;
}) {
  const [unclaimedRewards, setUnclaimedRewards] = useState(BigInt(0));
  const account = useAppKitAccount();
  const { checkLpRewards } = useLiquidity({
    tradingAddr: data?.poolAddress as `0x${string}`,
    campaignId: data?.identifier as `0x${string}`,
  });
  const displayClaimBtn = unclaimedRewards && unclaimedRewards > BigInt(0);

  useEffect(() => {
    (async function () {
      const fees = await checkLpRewards(account.address);
      if (fees && BigInt(fees) > BigInt(0)) {
        setUnclaimedRewards(fees);
      }
    })();
  }, [account.address, checkLpRewards]);

  const [isClaiming, setIsClaiming] = useState(false);
  const { claim } = useLiquidity({
    tradingAddr: data?.poolAddress as `0x${string}`,
    campaignId: data?.identifier as `0x${string}`,
  });
  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      await claim();
    } finally {
      setIsClaiming(false);
    }
  };

  const endDate = data?.ending
    ? new Date(data.ending).toLocaleString("default", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : "--";

  return (
    <div className="relative rounded-[12px] bg-[#fdfdfd] hover:bg-[#fafafa] transition-colors">
      <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
      <div className="relative flex items-center gap-[12px] p-[12px]">
        {/* Campaign pic */}
        {data?.picture ? (
          <Image
            src={data.picture}
            alt={data.name}
            width={40}
            height={40}
            className="size-[40px] rounded-[8px] object-cover flex-shrink-0"
          />
        ) : (
          <div className="size-[40px] rounded-[8px] bg-neutral-200 flex-shrink-0" />
        )}

        {/* Info */}
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <div className="flex items-center gap-[6px]">
            <Link
              href={`/campaign/${data?.identifier}`}
              className="font-overusedGrotesk font-semibold text-[13px] text-[#0e0e0e] hover:underline truncate"
            >
              {data?.name}
            </Link>
            {data?.winner && (
              <span className="font-dmMono text-[9px] uppercase px-[4px] py-[1px] rounded-[4px] bg-amber-50 text-amber-600">
                Concluded
              </span>
            )}
          </div>
          <span className="font-dmMono text-[9px] text-[#a3a3a3]">
            Ends {endDate}
          </span>
        </div>

        {/* Liquidity */}
        <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
            Liquidity
          </span>
          <span className="font-overusedGrotesk font-semibold text-[13px] text-[#0e0e0e]">
            ${formatFusdc(liquidity ?? "0", 2)}
          </span>
        </div>

        {/* Unclaimed */}
        <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
            Unclaimed
          </span>
          <span className="font-overusedGrotesk font-semibold text-[13px] text-[#0e0e0e]">
            ${formatFusdc(unclaimedRewards ?? "0", 2)}
          </span>
        </div>

        {/* Claim button */}
        {displayClaimBtn ? (
          <Button
            intent="yes"
            size="small"
            title={isClaiming ? "Claiming..." : "Claim Rewards"}
            onClick={handleClaim}
            disabled={isClaiming}
          />
        ) : null}
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
            <div className="h-[14px] w-[60px] rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
