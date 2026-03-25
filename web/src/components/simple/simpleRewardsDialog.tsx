import useDppmRewards from "@/hooks/useDppmRewards";
import { UnclaimedCampaign } from "@/types";
import Button from "../themed/button";
import Link from "next/link";
import { combineClass } from "@/utils/combineClass";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import RightCaretIcon from "#/icons/right-caret.svg";
import useClaimAllPools from "@/hooks/useClaimAllPools";
import useConnectWallet from "@/hooks/useConnectWallet";
import useClaimAllPoolsWithAS from "@/hooks/useClaimAllPoolsAS";
import useFeatureFlag from "@/hooks/useFeatureFlag";
import { useAppKitAccount } from "@reown/appkit/react";
import useBalance from "@/hooks/useBalance";
import formatFusdc from "@/utils/format/formatUsdc";

function SimpleRewardItem({
  data,
  address,
  setRewards,
}: {
  data: UnclaimedCampaign;
  address?: string;
  setRewards: React.Dispatch<
    React.SetStateAction<{ id: string; reward: number }[]>
  >;
}) {
  const { totalRewards: rewardDppm, isLoading } = useDppmRewards({
    tradingAddr: data.poolAddress,
    priceMetadata: data.priceMetadata,
    starting: data.starting,
    ending: data.ending,
    outcomes: data.outcomes,
    address,
  });
  const winnerOutcome = data.outcomes.find((o) => o.identifier === data.winner);
  const { data: sharesOfAmm } = useBalance(
    address,
    winnerOutcome?.share.address,
  );
  const rewardAmm = Number(formatFusdc(sharesOfAmm ?? 0, 2));
  const bodyClasses = "text-xs";
  const reward = data.isDppm ? rewardDppm : rewardAmm;
  const PnL = reward - data.totalSpent;

  useEffect(() => {
    if (reward) {
      setRewards((prev) => {
        if (prev.find((i) => i.id === data.identifier)) {
          return prev.map((i) =>
            i.id === data.identifier ? { id: data.identifier, reward } : i,
          );
        } else {
          return [...prev, { id: data.identifier, reward }];
        }
      });
    }
  }, [reward, data.identifier, setRewards]);

  return (
    <tr>
      <td className={bodyClasses}>{data.name}</td>
      <td className={bodyClasses}>${data.totalSpent}</td>
      <td className={bodyClasses}>${+reward.toFixed(2)}</td>
      <td className={bodyClasses}>
        {isLoading ? null : (
          <span
            className={combineClass(
              "self-start text-nowrap p-0.5 font-chicago text-xs",
              PnL >= 0 ? "bg-9green" : "bg-9red",
            )}
          >
            {PnL >= 0 ? "+" : "-"} ${Math.abs(PnL).toFixed(2)}
          </span>
        )}
      </td>
    </tr>
  );
}

export default function SimpleRewardsDialog({
  data,
  closeModal,
  token,
}: {
  data: UnclaimedCampaign[];
  closeModal: () => void;
  token?: string;
}) {
  const account = useAppKitAccount();
  const { connect } = useConnectWallet();
  const enableASClaim = useFeatureFlag("enable account system claim");
  const useAction = enableASClaim ? useClaimAllPoolsWithAS : useClaimAllPools;
  const { mutate: claimAllPools, isPending: claiming } = useAction(
    data,
    closeModal,
    token,
  );
  const [rewards, setRewards] = useState<{ id: string; reward: number }[]>([]);
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const totalRewards = +(
    rewards.reduce((acc, v) => acc + (v?.reward ?? 0), 0) || 0
  ).toFixed(2);

  const handleClick = () => {
    if (!account.address) return connect();
    claimAllPools({
      addresses: data.map((i) => i.poolAddress),
      walletAddress: account.address,
    });
  };
  return (
    <div className="flex flex-col space-y-3">
      <p className="text-center text-4xl">💰💰💰</p>
      <h3 className="text-center font-chicago text-2xl">
        Claim ${totalRewards} Rewards
      </h3>
      <p className="text-center text-xs">
        You have ${totalRewards} {token?.toUpperCase()} unclaimed rewards.
      </p>
      <table className="w-full table-auto border-separate border-spacing-y-1">
        <thead>
          <tr>
            <th className={tableHeaderClasses}>Campaign</th>
            <th className={tableHeaderClasses}>Spent</th>
            <th className={tableHeaderClasses}>Reward/Refund</th>
            <th className={tableHeaderClasses}>PnL</th>
          </tr>
        </thead>
        <tbody className="bg-9gray">
          {data.map((i) => (
            <SimpleRewardItem
              key={i.identifier}
              data={i}
              address={account.address}
              setRewards={setRewards}
            />
          ))}
        </tbody>
      </table>
      <Button
        intent={"reward"}
        size={"xlarge"}
        title={claiming ? "Claiming" : "Claim All Now"}
        disabled={claiming}
        onClick={handleClick}
      />
      <Link
        href={"/portfolio"}
        className="mx-auto flex items-center font-chicago text-xs underline"
      >
        More Details{" "}
        <Image
          alt=""
          src={RightCaretIcon}
          width={16}
          className="transition-transform group-data-[active]:rotate-90"
        />
      </Link>
    </div>
  );
}
