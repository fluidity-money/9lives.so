import useDppmRewards from "@/hooks/useDppmRewards";
import { UnclaimedCampaign } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import { Account } from "thirdweb/wallets";
import Button from "../themed/button";
import Link from "next/link";
import { combineClass } from "@/utils/combineClass";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import RightCaretIcon from "#/icons/right-caret.svg";

function SimpleRewardItem({
  data,
  account,
  setRewards,
}: {
  data: UnclaimedCampaign;
  account?: Account;
  setRewards: React.Dispatch<
    React.SetStateAction<{ id: string; reward: number }[]>
  >;
}) {
  const { totalRewards } = useDppmRewards({
    tradingAddr: data.poolAddress,
    priceMetadata: data.priceMetadata,
    starting: data.starting,
    ending: data.ending,
    outcomes: data.outcomes,
    account,
  });
  const bodyClasses = "text-xs font-chicago";
  const PnL = totalRewards - data.totalSpent;

  useEffect(() => {
    if (totalRewards) {
      setRewards((prev) => {
        if (prev.find((i) => i.id === data.identifier)) {
          return prev;
        } else {
          return [...prev, { id: data.identifier, reward: totalRewards }];
        }
      });
    }
  }, [totalRewards]);

  return (
    <tr>
      <td className={bodyClasses}>{data.name}</td>
      <td className={bodyClasses}>${data.totalSpent}</td>
      <td className={bodyClasses}>${totalRewards}</td>
      <td className={bodyClasses}>
        <span
          className={combineClass(
            "self-start text-nowrap p-0.5 font-chicago text-xs",
            PnL >= 0 ? "bg-9green" : "bg-9red",
          )}
        >
          {PnL >= 0 ? "+" : "-"} ${Math.abs(PnL).toFixed(2)}
        </span>
      </td>
    </tr>
  );
}

export default function SimpleRewardsDialog({
  data,
}: {
  data: UnclaimedCampaign[];
}) {
  const account = useActiveAccount();
  const [rewards, setRewards] = useState<{ id: string; reward: number }[]>([]);
  const tableHeaderClasses =
    "shadow-9tableHeader px-2 py-1 border border-black bg-[#DDD] text-left text-xs";
  const totalRewards = +(
    rewards.reduce((acc, v) => acc + (v?.reward ?? 0), 0) || 0
  ).toFixed(2);
  return (
    <div className="flex flex-col space-y-3">
      <p className="text-center text-4xl">💰💰💰</p>
      <h3 className="text-center font-chicago text-2xl">
        Claim ${totalRewards} Rewards
      </h3>
      <p className="text-center text-xs">
        You have accumulative of ${totalRewards} rewards unclaimed.
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
              account={account}
              setRewards={setRewards}
            />
          ))}
        </tbody>
      </table>
      <Button intent={"cta"} size={"xlarge"} title="Claim All Now" />
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
