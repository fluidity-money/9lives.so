"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppKitAccount } from "@reown/appkit/react";
import useParticipatedCampaigns from "@/hooks/useParticipatedCampaigns";
import usePositions from "@/hooks/usePositions";
import usePositionHistory from "@/hooks/usePositionsHistory";
import useDppmRewards from "@/hooks/useDppmRewards";
import useEstimateBurn from "@/hooks/useEstimateBurn";
import useClaim from "@/hooks/useClaim";
import useClaimAllPools from "@/hooks/useClaimAllPools";
import useClaimAllPoolsWithAS from "@/hooks/useClaimAllPoolsAS";
import { usePortfolioStore } from "@/stores/portfolioStore";
import useConnectWallet from "@/hooks/useConnectWallet";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import getDppmPrices from "@/utils/getDppmPrices";
import getAmmPrices from "@/utils/getAmmPrices";
import formatFusdc from "@/utils/format/formatUsdc";
import { combineClass } from "@/utils/combineClass";
import { calcTimePassed } from "@/utils/calcTimeDiff";
import config from "@/config";
import { Outcome, ParticipatedCampaign, PositionHistory } from "@/types";
import YesOutcomeImg from "#/images/yes-outcome.svg";
import NoOutcomeImg from "#/images/no-outcome.svg";
import Button from "../button";

// ---------------------------------------------------------------------------
// PositionsTab (orchestrator)
// ---------------------------------------------------------------------------

export default function PositionsTab() {
  const [hideSmallBalances, setHideSmallBalances] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useParticipatedCampaigns({});

  const positionGroups = data?.pages.flatMap((i) => i);

  const hasResults = !isLoading && !isError && (positionGroups?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
          {positionGroups?.length ?? 0} campaign(s)
        </span>
        <label className="flex items-center gap-[6px] cursor-pointer select-none">
          <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
            Hide Small Balances
          </span>
          <input
            type="checkbox"
            checked={hideSmallBalances}
            onChange={(e) => setHideSmallBalances(e.target.checked)}
            className="accent-[#0e0e0e] size-[14px]"
          />
        </label>
      </div>

      {/* Table header row */}
      {hasResults && <PositionsTableHeader />}

      {/* States */}
      {isError ? (
        <PlaceholderCard
          title="Error"
          subtitle={error?.message ?? "Unknown Error"}
        />
      ) : isLoading ? (
        <SkeletonCards />
      ) : positionGroups?.length === 0 ? (
        <PlaceholderCard
          title="Nothing yet."
          subtitle="Start Growing Your Portfolio."
        />
      ) : (
        positionGroups?.map((group) => (
          <PositionsGroup
            key={group.content.poolAddress}
            content={group.content}
            campaignId={group.campaignId}
            hideSmallBalances={hideSmallBalances}
          />
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
        ) : positionGroups && positionGroups.length > 0 ? (
          <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
            End of results
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared grid template — header + rows must use identical column widths so
// columns line up across the positions table.
// ---------------------------------------------------------------------------

const POSITIONS_GRID =
  "grid grid-cols-[40px_minmax(0,1fr)_72px_104px_104px_96px_128px_24px] items-center gap-[12px]";

function PositionsTableHeader() {
  return (
    <div
      className={combineClass(
        POSITIONS_GRID,
        "px-[12px] py-[8px] rounded-[8px] bg-[#fafafa] border border-[#e5e5e5]",
      )}
    >
      <span />
      <span />
      <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252] text-right">
        Price
      </span>
      <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252] text-right">
        Shares
      </span>
      <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252] text-right">
        Value
      </span>
      <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252] text-right">
        PnL
      </span>
      <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252] text-right">
        To Win
      </span>
      <span />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PositionsGroup (per campaign)
// ---------------------------------------------------------------------------

function PositionsGroup({
  content,
  campaignId,
  hideSmallBalances,
}: {
  content: NonNullable<ParticipatedCampaign["content"]>;
  campaignId: string;
  hideSmallBalances: boolean;
}) {
  const account = useAppKitAccount();
  const {
    isLoading,
    isError,
    error,
    data: positions,
  } = usePositions({
    tradingAddr: content.poolAddress as `0x${string}`,
    outcomes: content.outcomes as Outcome[],
    address: account.address,
    isDpm: content?.isDpm,
  });

  const dppmPrices = getDppmPrices(content.odds, content.outcomes);
  const ammPrices = Object.entries(getAmmPrices(content.shares) ?? {}).map(
    ([k, v]) => ({ id: k, price: v }),
  );
  const sharePrices = content.isDppm ? dppmPrices : ammPrices;

  const { data: positionsHistory } = usePositionHistory(
    account?.address,
    positions?.map((p) => p.id),
  );

  if (isLoading) return <SkeletonCards count={1} />;
  if (isError)
    return (
      <PlaceholderCard
        title="Whoops, error!"
        subtitle={error.message}
      />
    );

  const filtered = positions?.filter(
    (f) => !(hideSmallBalances && BigInt(1e4) >= f.balanceRaw),
  );

  if (!filtered || filtered.length === 0) return null;

  return (
    <>
      {filtered.map((item, idx) => (
        <PositionRow
          key={idx}
          campaignContent={content}
          data={item}
          price={sharePrices?.find((o) => o.id === item.id)?.price}
          history={positionsHistory?.filter((p) => p.outcomeId === item.id)}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// PositionRow (per outcome)
// ---------------------------------------------------------------------------

function PositionRow({
  data,
  price,
  history,
  campaignContent,
}: {
  data: {
    id: `0x${string}`;
    shareAddress: `0x${string}`;
    name: string;
    balance: string;
    balanceRaw: bigint;
    outcomePic?: string;
  };
  price?: string | number;
  history?: PositionHistory[];
  campaignContent: ParticipatedCampaign["content"];
}) {
  const account = useAppKitAccount();
  const { claim } = useClaim({
    shareAddr: data.shareAddress,
    outcomeId: data.id,
    tradingAddr: campaignContent.poolAddress as `0x${string}`,
    outcomes: campaignContent.outcomes as Outcome[],
    isDpm: campaignContent.isDpm,
  });
  const { connect } = useConnectWallet();
  const [isClaiming, setIsClaiming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const historicalValue = Math.trunc(
    history?.reduce((acc, v) => acc + v.fromAmount, 0) ?? 0,
  );

  const enableASClaim = useFeatureFlag("enable account system claim");
  const useAction = enableASClaim ? useClaimAllPoolsWithAS : useClaimAllPools;
  const { mutate: claimAllPools } = useAction([
    {
      ...data,
      priceMetadata: campaignContent.priceMetadata ?? {
        baseAsset: "btc",
        priceTargetForUp: "0",
      },
      isDppm: campaignContent.isDppm,
      winner: campaignContent.winner,
      outcomes: campaignContent.outcomes,
      identifier: campaignContent.identifier,
      poolAddress: campaignContent.poolAddress,
      starting: campaignContent.starting,
      ending: campaignContent.ending,
      totalSpent: historicalValue,
    },
  ]);

  const averageShareCost = +formatFusdc(historicalValue, 6) / +data.balance;

  const addPosition = usePortfolioStore((s) => s.addPositionValue);

  const { data: estimationOfBurn } = useEstimateBurn({
    outcomeId: data.id as `0x${string}`,
    share: data.balanceRaw,
    tradingAddr: campaignContent.poolAddress as `0x${string}`,
    address: account.address,
  });

  const {
    totalRewards,
    results: dppmRewards,
    isLoading: dppmLoading,
  } = useDppmRewards({
    tradingAddr: campaignContent.poolAddress,
    address: account.address,
    priceMetadata: campaignContent.priceMetadata,
    starting: campaignContent.starting,
    ending: campaignContent.ending,
    outcomes: campaignContent.outcomes,
    singleOutcomeId: campaignContent.isDppm ? data.id : undefined,
  });

  const isWinner =
    !!campaignContent.winner && campaignContent.isDppm
      ? totalRewards > 0
      : campaignContent.winner === data.id;

  const rewardDpm = 0;
  const rewardAmm = data.balance ? +data.balance : 0;
  const rewardDppm = totalRewards;
  const reward = campaignContent.isDpm
    ? rewardDpm
    : campaignContent.isDppm
      ? rewardDppm
      : rewardAmm;

  const PnL = campaignContent.isDppm
    ? Number(reward) - Number(formatFusdc(historicalValue, 6))
    : Number(
        formatFusdc(
          ((isWinner && !!reward
            ? BigInt(data.balanceRaw)
            : estimationOfBurn) ?? BigInt(0)) - BigInt(historicalValue),
          6,
        ),
      );

  const percentageChange = Math.abs(
    (PnL / +formatFusdc(historicalValue, 6)) * 100,
  ).toFixed(2);

  // --- portfolio store effects (same as V1) ---
  useEffect(() => {
    if (price && !isWinner) {
      addPosition({
        outcomeId: data.id,
        value: Number(price) * Number(data.balance),
        PnL,
      });
    }
  }, [price, data.id, data.balance, PnL, addPosition, isWinner]);

  useEffect(() => {
    if (reward && isWinner && historicalValue) {
      addPosition({
        outcomeId: data.id,
        value: reward,
        PnL: reward - +formatFusdc(historicalValue, 2),
      });
    }
  }, [reward, data.id, addPosition, isWinner, historicalValue]);

  async function handleClaim() {
    if (!account.address) return connect();
    try {
      setIsClaiming(true);
      if (campaignContent.isDppm) {
        await claimAllPools({
          addresses: [campaignContent.poolAddress],
          walletAddress: account.address,
        });
      } else {
        await claim(account.address, data.balanceRaw);
      }
    } finally {
      setIsClaiming(false);
    }
  }

  // Determine outcome image
  const outcomeSrc = data.outcomePic
    ? data.outcomePic
    : data.name === "Yes"
      ? YesOutcomeImg
      : data.name === "No"
        ? NoOutcomeImg
        : null;

  const isPositiveOutcome = data.name === "Yes" || data.name === "Up";
  const isNegativeOutcome = data.name === "No" || data.name === "Down";

  // Value display
  const valueDisplay =
    isWinner && reward
      ? `$${reward.toFixed(2)}`
      : campaignContent.isDppm
        ? `$${+totalRewards.toFixed(2)}`
        : `$${formatFusdc(estimationOfBurn ?? BigInt(0), 2)}`;

  const winnerPnL = isWinner && reward ? reward - +formatFusdc(historicalValue, 2) : 0;

  return (
    <div className="relative rounded-[12px] bg-[#fdfdfd]">
      <div className="absolute border border-[#e5e5e5] inset-0 pointer-events-none rounded-[12px]" />
      <div className="relative flex flex-col">
        {/* Main row */}
        <div
          className={combineClass(
            POSITIONS_GRID,
            "p-[12px] cursor-pointer hover:bg-[#fafafa] rounded-[12px] transition-colors",
          )}
          onClick={() => setShowHistory(!showHistory)}
        >
          {/* Outcome image (fixed 40px column, always present for alignment) */}
          <div className="size-[40px] flex items-center justify-center">
            {outcomeSrc && (
              <Image
                src={outcomeSrc}
                alt={data.name + "_" + campaignContent.name}
                width={40}
                height={40}
                className="size-[40px] rounded-[8px] object-cover"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-[4px] min-w-0">
            <div className="flex items-center gap-[6px] flex-wrap">
              <Link
                href={`/campaign/${campaignContent.identifier}`}
                onClick={(e) => e.stopPropagation()}
                className="font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e] hover:underline truncate"
              >
                {campaignContent.name}
              </Link>
              {campaignContent.winner && (
                <span className="font-dmMono text-[10px] uppercase px-[6px] py-[1px] rounded-[4px] bg-amber-50 text-amber-600">
                  Concluded
                </span>
              )}
              {isWinner && (
                <span className="font-dmMono text-[10px] uppercase px-[6px] py-[1px] rounded-[4px] bg-green-50 text-green-600">
                  Winner
                </span>
              )}
              {campaignContent.winner && campaignContent.winner !== data.id && !isWinner && (
                <span className="font-dmMono text-[10px] uppercase px-[6px] py-[1px] rounded-[4px] bg-red-50 text-red-600">
                  Lost
                </span>
              )}
            </div>

            <div className="flex items-center gap-[6px]">
              <span
                className={combineClass(
                  "font-dmMono text-[10px] uppercase px-[6px] py-[1px] rounded-[4px]",
                  isPositiveOutcome
                    ? "bg-green-50 text-green-600"
                    : isNegativeOutcome
                      ? "bg-red-50 text-red-600"
                      : "bg-neutral-100 text-neutral-500",
                )}
              >
                {data.name}
              </span>
              <Link
                href={`${config.destinationChain.blockExplorers.default.url}/token/${data.shareAddress}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-dmMono text-[11px] text-[#737373] hover:underline"
              >
                {data.shareAddress.slice(0, 6)}...{data.shareAddress.slice(-4)}
              </Link>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col items-end gap-[2px]">
            <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
              ${price ?? "--"}
            </span>
          </div>

          {/* Shares */}
          <div className="flex flex-col items-end gap-[2px]">
            <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
              {Number(data.balance) ? data.balance : "<0.01"}
            </span>
            {history && history.length > 0 && Number(data.balance) ? (
              <span className="font-dmMono text-[11px] text-[#737373]">
                AVG ${averageShareCost.toFixed(2)}
              </span>
            ) : null}
          </div>

          {/* Value */}
          <div className="flex flex-col items-end gap-[2px]">
            <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
              {valueDisplay}
            </span>
            <span className="font-dmMono text-[11px] text-[#737373]">
              Cost ${formatFusdc(historicalValue, 2)}
            </span>
          </div>

          {/* PnL */}
          <div className="flex flex-col items-end gap-[2px]">
            {isWinner && reward ? (
              <>
                {dppmLoading ? null : (
                  <>
                    <span
                      className={combineClass(
                        "font-overusedGrotesk font-semibold text-[14px]",
                        winnerPnL >= 0 ? "text-[#16a34a]" : "text-[#dc2626]",
                      )}
                    >
                      {winnerPnL >= 0 ? "+" : "-"}$
                      {Math.abs(winnerPnL).toFixed(2)}
                    </span>
                    <span className="font-dmMono text-[11px] text-[#737373]">
                      {winnerPnL >= 0 ? "+" : "-"}
                      {Math.abs(
                        ((winnerPnL) / +formatFusdc(historicalValue, 6)) * 100,
                      ).toFixed(2)}
                      %
                    </span>
                  </>
                )}
              </>
            ) : campaignContent.isDppm && !campaignContent.winner ? (
              <span className="font-dmMono text-[10px] uppercase px-[6px] py-[1px] rounded-[4px] bg-amber-50 text-amber-600">
                TBD
              </span>
            ) : (
              <>
                <span
                  className={combineClass(
                    "font-overusedGrotesk font-semibold text-[14px]",
                    PnL >= 0 ? "text-[#16a34a]" : "text-[#dc2626]",
                  )}
                >
                  {PnL >= 0 ? "+" : "-"}${Math.abs(PnL).toFixed(2)}
                </span>
                <span className="font-dmMono text-[11px] text-[#737373]">
                  {PnL >= 0 ? "+" : "-"}
                  {percentageChange}%
                </span>
              </>
            )}
          </div>

          {/* To Win column — unified for DPPM + AMM */}
          <div className="flex flex-col items-end gap-[3px]">
            {!campaignContent.isDpm && campaignContent.isDppm ? (
              dppmLoading ? (
                <span className="font-dmMono text-[11px] text-[#737373]">
                  ...
                </span>
              ) : (
                <>
                  <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
                    ${dppmRewards.dppmFusdc}
                  </span>
                  <span className="font-dmMono text-[11px] text-[#737373]">
                    +${dppmRewards.ninetailsWinnerFusdc} bonus
                  </span>
                  <span className="font-dmMono text-[11px] text-[#737373]">
                    +${dppmRewards.ninetailsLoserFusd} refund
                  </span>
                  {!campaignContent.winner && (
                    <span className="font-dmMono text-[10px] uppercase px-[6px] py-[1px] rounded-[4px] bg-amber-50 text-amber-600">
                      TBD
                    </span>
                  )}
                </>
              )
            ) : !campaignContent.isDpm && !campaignContent.isDppm ? (
              <span className="font-overusedGrotesk font-semibold text-[14px] text-[#0e0e0e]">
                ${data.balance}
              </span>
            ) : null}

            {isWinner && reward ? (
              <>
                <span className="font-dmMono text-[10px] uppercase px-[6px] py-[1px] rounded-[4px] bg-amber-50 text-amber-600">
                  ${reward.toFixed(2)} claimable
                </span>
                <Button
                  intent="yes"
                  size="xsmall"
                  title={isClaiming ? "Claiming..." : "Claim"}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleClaim();
                  }}
                  disabled={isClaiming}
                />
              </>
            ) : null}
          </div>

          {/* Chevron toggle */}
          <svg
            className={combineClass(
              "size-[16px] text-[#a3a3a3] transition-transform justify-self-end",
              showHistory && "rotate-180",
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Expandable history */}
        {showHistory && history && history.length > 0 && (
          <div className="border-t border-[#e5e5e5]">
            {history.map((h) => {
              const hPnL =
                h.type === "buy"
                  ? +formatFusdc(h.toAmount, 6) * Number(price ?? 0) -
                    +formatFusdc(h.fromAmount, 6)
                  : +formatFusdc(h.fromAmount, 6) * Number(price ?? 0) -
                    +formatFusdc(h.toAmount, 6);
              const hPercentageChange =
                h.type === "buy"
                  ? Math.abs(
                      (hPnL / +formatFusdc(h.fromAmount, 6)) * 100,
                    ).toFixed(2)
                  : "NaN";
              const hPrice =
                h.type === "buy"
                  ? h.fromAmount / h.toAmount
                  : h.toAmount / h.fromAmount;

              return (
                <div
                  key={h.txHash}
                  className={combineClass(
                    "flex items-center gap-[12px] px-[12px] py-[8px]",
                    h.type === "buy" ? "bg-green-50/40" : "bg-red-50/40",
                  )}
                >
                  {/* Type badge */}
                  <span
                    className={combineClass(
                      "font-dmMono text-[10px] uppercase px-[6px] py-[2px] rounded-[4px] w-[44px] text-center",
                      h.type === "buy"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600",
                    )}
                  >
                    {h.type}
                  </span>

                  {/* Price */}
                  <div className="flex flex-col items-end gap-[1px] min-w-[64px]">
                    <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
                      Price
                    </span>
                    <span className="font-overusedGrotesk text-[13px] text-[#0e0e0e]">
                      ${hPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Qty */}
                  <div className="flex flex-col items-end gap-[1px] min-w-[64px]">
                    <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
                      Qty
                    </span>
                    <span className="font-overusedGrotesk text-[13px] text-[#0e0e0e]">
                      {h.type === "buy" ? "+" : "-"}
                      {formatFusdc(
                        h.type === "buy" ? h.toAmount : h.fromAmount,
                        2,
                      )}{" "}
                      <span
                        className={combineClass(
                          "font-dmMono text-[10px] px-[4px] py-[1px] rounded-[3px]",
                          isPositiveOutcome
                            ? "bg-green-50 text-green-600"
                            : isNegativeOutcome
                              ? "bg-red-50 text-red-600"
                              : "bg-neutral-100 text-neutral-500",
                        )}
                      >
                        {data.name}
                      </span>
                    </span>
                  </div>

                  {/* Cost */}
                  <div className="flex flex-col items-end gap-[1px] min-w-[64px]">
                    <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
                      Cost
                    </span>
                    <span className="font-overusedGrotesk text-[13px] text-[#0e0e0e]">
                      $
                      {formatFusdc(
                        h.type === "buy" ? h.fromAmount : h.toAmount,
                        2,
                      )}
                    </span>
                  </div>

                  {/* PnL */}
                  <div className="flex flex-col items-end gap-[1px] min-w-[64px]">
                    <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#525252]">
                      PnL
                    </span>
                    <span
                      className={combineClass(
                        "font-overusedGrotesk text-[13px] font-semibold",
                        hPnL >= 0 ? "text-[#16a34a]" : "text-[#dc2626]",
                      )}
                    >
                      {hPnL >= 0 ? "+" : "-"}${Math.abs(hPnL).toFixed(2)}
                    </span>
                    <span className="font-dmMono text-[11px] text-[#737373]">
                      {hPnL >= 0 ? "+" : "-"}
                      {hPercentageChange}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared UI helpers
// ---------------------------------------------------------------------------

function PlaceholderCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-[8px] py-[40px] rounded-[12px] border border-[#e5e5e5] bg-[#fdfdfd]">
      <span className="font-overusedGrotesk font-semibold text-[15px] text-[#0e0e0e]">
        {title}
      </span>
      {subtitle && (
        <span className="font-dmMono text-[11px] uppercase tracking-[0.5px] text-[#737373]">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
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
            <div className="flex gap-[16px]">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col items-end gap-[4px]">
                  <div className="h-[8px] w-[30px] rounded bg-neutral-100" />
                  <div className="h-[14px] w-[50px] rounded bg-neutral-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
