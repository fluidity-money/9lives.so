import useDppmRewards from "@/hooks/useDppmRewards";
import { UnclaimedCampaign } from "@/types";
import Button from "./button";
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
  const { totalRewards } = useDppmRewards({
    tradingAddr: data.poolAddress,
    priceMetadata: data.priceMetadata,
    starting: data.starting,
    ending: data.ending,
    outcomes: data.outcomes,
    address,
  });
  const bodyClasses = "text-xs";
  const PnL = totalRewards - data.totalSpent;

  useEffect(() => {
    if (totalRewards) {
      setRewards((prev) => {
        if (prev.find((i) => i.id === data.identifier)) {
          return prev.map((i) =>
            i.id === data.identifier
              ? { id: data.identifier, reward: totalRewards }
              : i,
          );
        } else {
          return [...prev, { id: data.identifier, reward: totalRewards }];
        }
      });
    }
  }, [totalRewards, data.identifier, setRewards]);

  return (
    <tr>
      <td className={bodyClasses}>{data.name}</td>
      <td className={bodyClasses}>${data.totalSpent}</td>
      <td className={bodyClasses}>${+totalRewards.toFixed(2)}</td>
      <td className={bodyClasses}>
        <span
          className={combineClass(
            "self-start text-nowrap rounded-lg p-0.5 text-xs",
            PnL >= 0 ? "bg-green-300" : "bg-red-300",
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
  const tableHeaderClasses = "py-1 text-left text-xs";
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
    <div className="relative flex max-w-[600px] flex-col space-y-3 rounded-2xl border border-neutral-400 p-4">
      <div
        className="absolute right-2 top-2 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-2white/20"
        onClick={closeModal}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.5 3.5L3.5 12.5"
            stroke="#A3A3A3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 12.5L3.5 3.5"
            stroke="#A3A3A3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex gap-4">
        <p className="text-center text-4xl">🤑</p>
        <div className="flex flex-1 flex-col gap-4">
          <h3 className="text-left text-xl font-semibold">
            Claim ${totalRewards} Rewards
          </h3>
          <p className="text-sm font-medium text-neutral-600">
            You have accumulative of ${totalRewards} {token?.toUpperCase()}{" "}
            rewards unclaimed.
          </p>

          <div className="rounded-xl bg-neutral-100 p-3 shadow-[inset_1px_1px_2px_0px_rgba(163,163,163,0.70)]">
            <table className="w-full table-auto border-separate border-spacing-y-1">
              <thead>
                <tr>
                  <th className={tableHeaderClasses}>Campaign</th>
                  <th className={tableHeaderClasses}>Spent</th>
                  <th className={tableHeaderClasses}>Reward/Refund</th>
                  <th className={tableHeaderClasses}>PnL</th>
                </tr>
              </thead>
              <tbody>
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
          </div>
        </div>
      </div>

      <div>
        <div className="mt-2 flex items-center gap-2">
          <Link
            href={"/v1/portfolio"}
            className="mx-auto flex flex-1 items-center font-chicago text-xs underline"
          >
            <Button
              title="More Details"
              intent={"inverted"}
              // size={'large'}
              className={"flex-1"}
              icon={
                <svg
                  width="19"
                  height="20"
                  viewBox="0 0 19 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.05389 3.30028C3.30294 3.28887 2.68868 3.8887 2.68141 4.63961C2.67419 5.39051 3.27672 6.00888 4.02768 6.02034L11.4387 6.13344L3.35794 14.2142C2.82837 14.7438 2.83078 15.6048 3.36331 16.1373C3.89585 16.6698 4.75686 16.6723 5.28643 16.1427L13.3672 8.06192L13.4803 15.4729C13.4917 16.2239 14.1101 16.8264 14.861 16.8192C15.6119 16.8119 16.2118 16.1977 16.2003 15.4467L16.0377 4.80987C16.0264 4.07209 15.4285 3.4742 14.6908 3.46294L4.05389 3.30028Z"
                    fill="#181818"
                  />
                </svg>
              }
            />
          </Link>
          <Button
            intent={"reward"}
            // size={"large"}
            title={claiming ? "Claiming" : "Claim All Now"}
            disabled={claiming}
            onClick={handleClick}
            className={"flex-1"}
          />
        </div>
      </div>
    </div>
  );
}
