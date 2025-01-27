import { CampaignDetail } from "@/types";
import ShadowCard from "../cardShadow";
import CrownImg from "#/images/crown.svg";
import Image from "next/image";
import Button from "../themed/button";
import usePositions from "@/hooks/usePositions";
import { useActiveAccount } from "thirdweb/react";
import SparkleImg from "#/images/sparkle.svg";
import useConnectWallet from "@/hooks/useConnectWallet";
import useClaim from "@/hooks/useClaim";
import { useState } from "react";
import YesOutcomeImg from "#/images/yes-outcome.svg";
import NoOutcomeImg from "#/images/no-outcome.svg";
import formatFusdc from "@/utils/formatFusdc";
import useChances from "@/hooks/useChances";

interface DetailResultsProps {
  data: CampaignDetail;
  tradingAddr: `0x${string}`;
}
export default function DetailResults({
  tradingAddr,
  data,
}: DetailResultsProps) {
  const account = useActiveAccount();
  const { connect, isConnecting } = useConnectWallet();
  const [isClaiming, setIsClaiming] = useState(false);
  const { data: positionData } = usePositions({
    tradingAddr,
    outcomes: data.outcomes,
    account,
  });
  const winner = data.outcomes.find(
    (item) => item.identifier === `0x${data.winner}`,
  )! as CampaignDetail["outcomes"][number];

  const { claim } = useClaim({
    shareAddr: winner.share.address,
    tradingAddr,
    outcomeId: winner.identifier,
  });
  const chances = useChances({
    investmentAmounts: data.investmentAmounts,
    totalVolume: data.totalVolume,
    outcomeIds: data.outcomes.map((o) => o.identifier),
  });
  const winnerChance = chances.find((o) => o.id === winner.identifier)?.chance;
  const winnerShares = data?.investmentAmounts.find(
    (o) => o.id === winner.identifier,
  )!.share;
  const avgPrice = Number(data.totalVolume) / Number(winnerShares);
  const accountShares = positionData?.reduce((acc, item) => {
    if (item.id === winner.identifier) {
      acc += Number(item.balance);
    }
    return acc;
  }, 0);
  const rewardBreakdown = [
    {
      title: "Your Shares",
      value: `${accountShares}`,
    },
    {
      title: "Total Investment",
      value: `$${formatFusdc(data.totalVolume)}`,
    },
    {
      title: "Total Shares of The Winner",
      value: formatFusdc(winnerShares ?? 0),
    },
    {
      title: "Avg. Price/Share",
      value: `$${avgPrice.toFixed(3)}`,
    },
  ];
  const noClaim =
    account && accountShares !== undefined && !(accountShares > 0);
  async function handleClaim() {
    if (!account) return connect();
    try {
      setIsClaiming(true);
      await claim(account, accountShares!, data.outcomes);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <ShadowCard className="sticky top-0 z-10 flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            alt=""
            width={20}
            className="absolute inset-x-0 -top-2 mx-auto h-auto"
            src={CrownImg}
          />
          <div className="size-10 overflow-hidden rounded-full">
            <Image
              width={40}
              height={40}
              alt={winner.name}
              src={
                data.isYesNo
                  ? winner.name === "Yes"
                    ? YesOutcomeImg
                    : NoOutcomeImg
                  : winner.picture
              }
              className="size-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-chicago text-base font-normal text-9black">
            {winner.name}
          </h3>
          <div className="flex items-center gap-1 font-geneva text-[10px]">
            <span className="uppercase">Chance</span>
            <span className="bg-9green px-1 py-0.5">
              {winnerChance ? Math.round(winnerChance) : "?"}%
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-chicago uppercase">Claimable Rewards</span>
        <div className="flex items-center gap-1">
          <span className="font-chicago text-2xl">
            $
            {account
              ? accountShares
                ? (accountShares * avgPrice).toFixed(3)
                : 0
              : "?"}
          </span>
          <Image src={SparkleImg} alt="" width={23} className="h-auto" />
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-9gray p-5 text-xs shadow-9orderSummary">
        <span className="font-chicago uppercase">Reward Breakdown</span>
        <ul className="flex flex-col gap-1 text-gray-500">
          {rewardBreakdown.map((item) => (
            <li className="flex items-center justify-between" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        disabled={noClaim || isConnecting || isClaiming}
        title={
          isClaiming
            ? "Claiming..."
            : noClaim
              ? "No Rewards to Claim"
              : "Claim Your Rewards"
        }
        className="uppercase"
        intent="yes"
        size="xlarge"
        onClick={handleClaim}
      />
    </ShadowCard>
  );
}
