"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppKitAccount } from "@reown/appkit/react";
import useCampaigns from "@/hooks/useCampaigns";
import { Campaign, CampaignFilters } from "@/types";
import Button from "../button";

export default function CampaignsTab() {
  const [orderBy, setOrderBy] =
    useState<CampaignFilters["orderBy"]>("newest");
  const account = useAppKitAccount();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCampaigns({
    orderBy,
    address: account.address,
    userList: true,
  });

  const campaigns = data?.pages.flatMap((c) => c);

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Sort control */}
      <div className="flex items-center justify-between">
        <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
          Your Campaigns
        </span>
        <select
          value={orderBy}
          onChange={(e) =>
            setOrderBy(e.target.value as CampaignFilters["orderBy"])
          }
          className="font-dmMono text-[11px] text-[#0e0e0e] bg-[#fdfdfd] border border-[#e5e5e5] rounded-[8px] px-[8px] py-[4px] outline-none"
        >
          <option value="newest">Newest</option>
          <option value="ending_soonest">Ending Soon</option>
          <option value="highest_volume">Highest Vol</option>
        </select>
      </div>

      {/* States */}
      {isError ? (
        <PlaceholderCard
          title="Whoops, error!"
          subtitle={error instanceof Error ? error.message : "Unknown error"}
        />
      ) : isLoading ? (
        <SkeletonList />
      ) : campaigns?.length === 0 ? (
        <PlaceholderCard
          title="No campaigns yet."
          subtitle="Create your first campaign to get started."
        />
      ) : (
        campaigns?.map((campaign) => (
          <CampaignRow key={campaign.identifier} data={campaign} />
        ))
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center py-[8px]">
        {hasNextPage ? (
          <Button
            intent="cta"
            size="small"
            disabled={isFetchingNextPage}
            title={isFetchingNextPage ? "Loading..." : "Show More"}
            onClick={() => fetchNextPage()}
          />
        ) : campaigns && campaigns.length > 0 ? (
          <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
            End of results
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CampaignRow({ data }: { data: Campaign }) {
  const endDate = data.ending
    ? new Date(data.ending).toLocaleString("default", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
    : "--";

  return (
    <Link href={`/campaign/${data.identifier}`}>
      <div className="relative rounded-[12px] bg-[#fdfdfd] hover:bg-[#fafafa] transition-colors cursor-pointer">
        <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
        <div className="relative flex items-center gap-[12px] p-[12px]">
          {data.picture ? (
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

          <div className="flex flex-col gap-[4px] flex-1 min-w-0">
            <div className="flex items-center gap-[6px]">
              <span className="font-overusedGrotesk font-semibold text-[13px] text-[#0e0e0e] truncate">
                {data.name}
              </span>
              {data.winner && (
                <span className="font-dmMono text-[9px] uppercase px-[4px] py-[1px] rounded-[4px] bg-amber-50 text-amber-600">
                  Concluded
                </span>
              )}
            </div>
            <span className="font-dmMono text-[9px] text-[#a3a3a3]">
              Ends {endDate}
            </span>
          </div>

          <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
            <span className="font-dmMono text-[9px] uppercase text-[#a3a3a3]">
              Volume
            </span>
            <span className="font-overusedGrotesk font-semibold text-[13px] text-[#0e0e0e]">
              ${data.totalVolume?.toLocaleString() ?? "0"}
            </span>
          </div>
        </div>
      </div>
    </Link>
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
              <div className="h-[14px] w-[160px] rounded bg-neutral-200" />
              <div className="h-[10px] w-[80px] rounded bg-neutral-100" />
            </div>
            <div className="h-[14px] w-[60px] rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
