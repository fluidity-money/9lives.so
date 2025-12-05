import Link from "next/link";
import config from "@/config";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import formatFusdc from "@/utils/format/formatUsdc";
import Button from "../themed/button";
import DownCaret from "#/icons/down-caret.svg";
import useClaim from "@/hooks/useClaim";
import { useActiveAccount } from "thirdweb/react";
import { Outcome, ParticipatedCampaign } from "@/types";
import useConnectWallet from "@/hooks/useConnectWallet";
import YesOutcomeImg from "#/images/yes-outcome.svg";
import NoOutcomeImg from "#/images/no-outcome.svg";
import UsdIcon from "#/icons/usd.svg";
import useEstimateBurn from "@/hooks/useEstimateBurn";
import useDppmRewards from "@/hooks/useDppmRewards";
import useDppmClaimAll from "@/hooks/useDppmClaimAll";
export default function PositionRow({
  data,
  price,
  history,
  detailPage,
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
  detailPage?: boolean;
  price?: string;
  history?: {
    fromAmount: number;
    toAmount: number;
    id: string;
    txHash: string;
    type: "buy" | "sell";
  }[];
  campaignContent: ParticipatedCampaign["content"];
}) {
  const account = useActiveAccount();
  const { claim } = useClaim({
    shareAddr: data.shareAddress,
    outcomeId: data.id,
    tradingAddr: campaignContent.poolAddress as `0x${string}`,
    outcomes: campaignContent.outcomes as Outcome[],
    isDpm: campaignContent.isDpm,
  });
  const { claimAll } = useDppmClaimAll({
    tradingAddr: campaignContent.poolAddress,
    outcomes: campaignContent.outcomes,
  });
  const { connect } = useConnectWallet();
  const [isClaiming, setIsClaiming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const historicalValue = Math.trunc(
    history?.reduce((acc, v) => acc + v.fromAmount, 0) ?? 0,
  );
  const averageShareCost = +formatFusdc(historicalValue, 6) / +data.balance;
  const addPosition = usePortfolioStore((s) => s.addPositionValue);
  const { data: estimationOfBurn } = useEstimateBurn({
    outcomeId: data.id as `0x${string}`,
    share: data.balanceRaw,
    tradingAddr: campaignContent.poolAddress as `0x${string}`,
    account,
  });
  const { totalRewards, results: dppmRewards } = useDppmRewards({
    tradingAddr: campaignContent.poolAddress,
    account,
    priceMetadata: campaignContent.priceMetadata,
    starting: campaignContent.starting,
    ending: campaignContent.ending,
    outcomes: campaignContent.outcomes,
    singleOutcomeId: campaignContent.isDppm ? data.id : undefined,
  });
  const PnL = campaignContent.isDppm
    ? totalRewards - Number(formatFusdc(historicalValue, 6))
    : Number(
        formatFusdc((estimationOfBurn ?? BigInt(0)) - BigInt(historicalValue)),
      );
  const percentageChange = Math.abs(
    (PnL / +formatFusdc(historicalValue, 6)) * 100,
  ).toFixed(2);

  const isWinner =
    !!campaignContent.winner && campaignContent.isDppm
      ? totalRewards > 0
      : campaignContent.winner === data.id;
  // const totalSharesOfWinner = campaign.investmentAmounts.find((i) => i?.id === data.id)?.share;
  // totalSharesOfWinner should get from investmentAmounts (expensive), and needs to be implemented if dpm markets activated
  // const avgPrice = campaignContent.totalVolume / totalSharesOfWinner;
  // const rewardDpm = data.balance ? +data.balance * avgPrice : 0;
  const rewardDpm = 0;
  const rewardAmm = data.balance ? +data.balance : 0;
  const rewardDppm = totalRewards;
  const reward = campaignContent.isDpm
    ? rewardDpm
    : campaignContent.isDppm
      ? rewardDppm
      : rewardAmm;
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
    if (!account) return connect();
    try {
      setIsClaiming(true);
      if (campaignContent.isDppm) {
        await claimAll(account);
      } else {
        await claim(account, data.balanceRaw);
      }
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <>
      <tr>
        <td
          onClick={() => setShowHistory(!showHistory)}
          className="cursor-pointer bg-[#DDDDDD] align-baseline"
        >
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              {!detailPage &&
              (data.outcomePic ||
                (!data.outcomePic &&
                  (data.name === "Yes" || data.name === "No"))) ? (
                <Image
                  src={
                    !data.outcomePic
                      ? data.name === "Yes"
                        ? YesOutcomeImg
                        : NoOutcomeImg
                      : data.outcomePic
                  }
                  alt={data.name + "_" + campaignContent.name}
                  width={40}
                  height={40}
                  className="size-10 self-start border border-9black bg-9layer"
                />
              ) : null}
              <div className="flex flex-col gap-1">
                {!detailPage ? (
                  <p className="font-chicago text-xs font-bold">
                    <Link
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="underline"
                      href={`/campaign/${campaignContent.identifier}`}
                    >
                      {campaignContent.name}
                    </Link>{" "}
                    {campaignContent.winner && (
                      <span className="bg-9yellow p-0.5 font-geneva text-[10px] uppercase tracking-wide">
                        Concluded
                      </span>
                    )}
                    {isWinner && (
                      <span className="ml-1 bg-9green p-0.5 font-geneva text-[10px] font-normal uppercase tracking-wide">
                        Winner
                      </span>
                    )}
                    {campaignContent.winner &&
                      campaignContent.winner !== data.id && (
                        <span className="ml-1 bg-9red p-0.5 font-geneva text-[10px] font-normal uppercase tracking-wide">
                          Lost
                        </span>
                      )}
                  </p>
                ) : null}
                <p
                  className={combineClass(
                    "self-start px-1 py-0.5 font-geneva text-xs uppercase tracking-wide text-9black",
                    data.name === "Yes" || data.name === "Up"
                      ? "bg-9green"
                      : data.name === "No" || data.name === "Down"
                        ? "bg-9red"
                        : "bg-9layer",
                  )}
                >
                  {data.name}
                </p>
                <div className="flex items-center gap-1">
                  {!detailPage ? (
                    <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
                      Share Addr:
                    </span>
                  ) : null}
                  <Link
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    href={`${config.destinationChain.blockExplorers![0].url}/token/${data.shareAddress}`}
                    target="_blank"
                    className="inline self-start"
                  >
                    <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080] underline">
                      {data.shareAddress.slice(0, 4)}...
                      {data.shareAddress.slice(-4)}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
            <Image
              src={DownCaret}
              alt=""
              className={combineClass("size-4", showHistory && "rotate-180")}
            />
          </div>
        </td>
        <td className="pl-2">
          <span className="font-chicago text-xs">${price}</span>
        </td>
        <td>
          <div className="flex flex-col gap-1">
            <span className="font-chicago text-xs">
              {Number(data.balance) ? data.balance : "<0.01"}{" "}
              <span
                className={combineClass(
                  "p-0.5",
                  data.name === "Yes" || data.name === "Up"
                    ? "bg-9green"
                    : data.name === "No" || data.name === "Down"
                      ? "bg-9red"
                      : "bg-9gray",
                )}
              >
                {data.name}
              </span>
            </span>
            {history && history.length > 0 && Number(data.balance) ? (
              <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
                AVG ${averageShareCost.toFixed(2)}/Share
              </span>
            ) : null}
          </div>
        </td>
        <td>
          <div className="flex flex-col gap-1">
            {isWinner && reward ? (
              <span className="font-chicago text-xs">${reward.toFixed(2)}</span>
            ) : (
              <span className="font-chicago text-xs">
                $
                {campaignContent.isDppm
                  ? +totalRewards.toFixed(2)
                  : formatFusdc(estimationOfBurn ?? BigInt(0), 2)}
              </span>
            )}
            <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
              COST ${formatFusdc(historicalValue, 2)}
            </span>
          </div>
        </td>
        <td>
          {isWinner && reward ? (
            <div className="flex flex-col gap-2 py-2 pr-2">
              <span
                className={combineClass(
                  "self-start p-0.5 font-chicago text-xs",
                  reward - +formatFusdc(historicalValue, 2) >= 0
                    ? "bg-9green"
                    : "bg-9red",
                )}
              >
                {reward - +formatFusdc(historicalValue, 2) >= 0 ? "+" : "-"} $
                {Math.abs(reward - +formatFusdc(historicalValue, 2)).toFixed(2)}
              </span>
              <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
                {reward - +formatFusdc(historicalValue, 2) >= 0 ? "+" : "-"}
                {Math.abs(
                  ((reward - +formatFusdc(historicalValue, 2)) /
                    +formatFusdc(historicalValue, 6)) *
                    100,
                ).toFixed(2)}
                {"%"}
              </span>
              <div className="flex items-center gap-1 self-start bg-9yellow p-0.5">
                <Image src={UsdIcon} alt="" width={20} />
                <span className="font-chicago text-xs">
                  {" "}
                  ${reward.toFixed(2)}
                </span>
              </div>
              {detailPage ? null : (
                <Button
                  title={isClaiming ? "Claiming..." : "Claim Reward"}
                  intent={"yes"}
                  onClick={handleClaim}
                  disabled={isClaiming}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {campaignContent.isDppm && !campaignContent.winner ? (
                <span className="self-start bg-9yellow p-0.5 font-chicago text-xs">
                  TBD
                </span>
              ) : (
                <span
                  className={combineClass(
                    "self-start p-0.5 font-chicago text-xs",
                    PnL >= 0 ? "bg-9green" : "bg-9red",
                  )}
                >
                  {PnL >= 0 ? "+" : "-"} ${Math.abs(PnL).toFixed(2)}
                </span>
              )}
              {campaignContent.isDppm && !campaignContent.winner ? null : (
                <span className="font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
                  {PnL >= 0 ? "+" : "-"}
                  {percentageChange}
                  {"%"}
                </span>
              )}
            </div>
          )}
        </td>
        {campaignContent.isDpm ? null : (
          <td>
            {campaignContent.isDppm ? (
              <div>
                {!detailPage ? (
                  <p className="flex flex-col items-start gap-0.5 text-wrap font-chicago text-xs">
                    <span>
                      <span className="font-geneva text-[#808080]">
                        Reward:
                      </span>{" "}
                      ${dppmRewards.dppmFusdc}
                    </span>
                    <span>
                      <span className="font-geneva text-[#808080]">Bonus:</span>{" "}
                      ${dppmRewards.ninetailsWinnerFusdc}
                    </span>
                    <span>
                      <span className="font-geneva text-[#808080]">
                        Refund:
                      </span>{" "}
                      ${dppmRewards.ninetailsLoserFusd}
                    </span>
                  </p>
                ) : (
                  <span className="font-chicago text-xs">
                    ${totalRewards.toFixed(2)}
                  </span>
                )}
                {!campaignContent.winner ? (
                  <span className="self-start bg-9yellow p-0.5 font-chicago text-xs">
                    TBD
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="font-chicago text-xs">${data.balance}</span>
            )}
          </td>
        )}
      </tr>
      {showHistory &&
        history?.map((h) => {
          const PnL =
            h.type === "buy"
              ? +formatFusdc(h.toAmount, 6) * Number(price ?? 0) -
                +formatFusdc(h.fromAmount, 6)
              : +formatFusdc(h.fromAmount, 6) * Number(price ?? 0) -
                +formatFusdc(h.toAmount, 6);
          const percentageChange =
            h.type === "buy"
              ? Math.abs((PnL / +formatFusdc(h.fromAmount, 6)) * 100).toFixed(2)
              : "Nan";
          return (
            <tr
              key={h.txHash}
              className={combineClass(
                h.type === "buy" ? "bg-9green/20" : "bg-9red/20",
              )}
            >
              <td>
                <span className="pl-2 font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
                  {h.type} tx
                </span>
              </td>
              <td className="pl-2">
                <span className="font-chicago text-xs">
                  $
                  {(h.type === "buy"
                    ? h.fromAmount / h.toAmount
                    : h.toAmount / h.fromAmount
                  ).toFixed(2)}
                </span>
              </td>
              <td>
                <span className="font-chicago text-xs">
                  {h.type === "buy" ? "+" : "-"}
                  {formatFusdc(
                    h.type === "buy" ? h.toAmount : h.fromAmount,
                    2,
                  )}{" "}
                  <span
                    className={combineClass(
                      "p-0.5",
                      data.name === "Yes" || data.name === "Up"
                        ? "bg-9green"
                        : data.name === "No" || data.name === "Down"
                          ? "bg-9red"
                          : "bg-9gray",
                    )}
                  >
                    {data.name}
                  </span>
                </span>
              </td>
              <td>
                <span className="font-chicago text-xs">
                  $
                  {formatFusdc(h.type === "buy" ? h.fromAmount : h.toAmount, 2)}
                </span>
              </td>
              <td>
                <div className="flex flex-col gap-1 py-1">
                  <span
                    className={combineClass(
                      "self-start p-0.5 font-chicago text-xs",
                      PnL >= 0 ? "bg-9green" : "bg-9red",
                    )}
                  >
                    {PnL >= 0 ? "+" : "-"} ${Math.abs(PnL).toFixed(2)}
                  </span>
                  <span className="ml-1 font-geneva text-[10px] uppercase tracking-wide text-[#808080]">
                    {PnL >= 0 ? "+" : "-"}
                    {percentageChange}
                    {"%"}
                  </span>
                </div>
              </td>
              {campaignContent.isDpm ? null : <td></td>}
            </tr>
          );
        })}
    </>
  );
}
