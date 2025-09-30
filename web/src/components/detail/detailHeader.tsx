import Image from "next/image";
import WatchlistButton from "../watchlistButton";
import { CampaignDetail } from "@/types";
import ActiveIndicator from "#/images/active-indicator.svg";
import InactiveIndicator from "#/images/inactive-indicator.svg";
import { combineClass } from "@/utils/combineClass";
import SadFaceIcon from "#/icons/sad-face.svg";
import UsdIcon from "#/icons/usd.svg";
import DetailCreatedBy from "./detailCreatedBy";
import formatFusdc from "@/utils/formatFusdc";
import { CountdownTimer } from "../countdownTimer";
import { ReactNode, useEffect, useState } from "react";
import Modal from "../themed/modal";
import ManageLiquidityDialog from "../manageLiquidityDialog";
import Button from "../themed/button";
import useClaimAllFees from "@/hooks/useClaimAllFees";
import { useActiveAccount } from "thirdweb/react";
import ClaimFeesButton from "../claimFeesButton";

const HeaderBox = ({
  title,
  value,
  shrink = false,
  rightComp,
}: {
  title: string;
  value: string;
  shrink?: boolean;
  rightComp?: ReactNode;
}) => (
  <div
    className={combineClass(
      shrink ? "shrink-1" : "flex-1",
      "flex justify-between gap-4 rounded-[3px] border-[1.5px] border-9black bg-[#fafafa] px-4 py-2 text-xs shadow-9liqCard",
    )}
  >
    <div className="flex flex-col gap-1">
      <span className="font-geneva text-xs uppercase text-[#808080]">
        {title}
      </span>
      <span className="font-chicago text-lg">{value}</span>
    </div>
    {rightComp ? rightComp : null}
  </div>
);

export default function DetailHeader({
  data,
  isEnded,
  isConcluded,
  isDpm,
}: {
  data: CampaignDetail;
  isEnded: boolean;
  isConcluded: boolean;
  isDpm: boolean | null;
}) {
  const account = useActiveAccount();
  const left = data.ending - Math.floor(Date.now() / 1000);
  const weekDuration = 60 * 60 * 24 * 7;
  const inThisWeek = weekDuration >= left && left > 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unclaimedFees, setUnclaimedFees] = useState(BigInt(0));
  const displayCreatorFees = unclaimedFees > BigInt(0);
  const { checkClaimFees } = useClaimAllFees();
  const LiquidityComp = () => (
    <div className="flex flex-row gap-1">
      <Button title="+" intent={"yes"} onClick={() => setIsModalOpen(true)} />
      <Button title="-" intent={"no"} onClick={() => setIsModalOpen(true)} />
    </div>
  );

  const subHeaderMap = [
    {
      title: isDpm ? "TVL" : "Total Vol.",
      value: `$${formatFusdc(data.totalVolume, 2)}`,
      show: true,
    },
    {
      title: "Total Liq.",
      value: `$${formatFusdc(data.liquidityVested, 2)}`,
      show: !isDpm,
      rightComp: <LiquidityComp />,
    },
    {
      title: "Creator Fees",
      value: `$${formatFusdc(unclaimedFees, 2)}`,
      show: displayCreatorFees,
      rightComp: <ClaimFeesButton address={data.poolAddress} />,
      shrink: true,
    },
  ];

  useEffect(() => {
    if (data.creator.address === account?.address) {
      (async () => {
        const unclaimedFees = await checkClaimFees(data.poolAddress, account);
        if (unclaimedFees > BigInt(0)) {
          setUnclaimedFees(unclaimedFees);
        }
      })();
    }
  }, [account?.address]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          {data.picture ? (
            <Image
              alt="tldr"
              width={60}
              height={60}
              className="border border-9black"
              src={data.picture}
            />
          ) : null}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <div className="flex items-center gap-2.5">
              <Image
                src={
                  isConcluded || isEnded ? InactiveIndicator : ActiveIndicator
                }
                alt=""
                className="h-[16px] w-auto"
                height={16}
              />{" "}
              <h1 className="font-chicago text-xl md:text-2xl">{data.name}</h1>
            </div>
          </div>
        </div>
        {isConcluded ? (
          Number(data.totalVolume) > 0 ? (
            <div className="flex items-center justify-center gap-[5px] self-center bg-9yellow px-2.5 py-[5px]">
              <Image src={UsdIcon} alt="" width={20} />
              <span className="font-geneva text-xs uppercase text-9black">
                rewards available
              </span>
            </div>
          ) : (
            <div className="flex gap-[5px] bg-[#CCC] px-2.5 py-[5px]">
              <Image src={SadFaceIcon} alt="" width={15} />
              <span className="font-geneva text-xs uppercase text-[#808080]">
                No available rewards
              </span>
            </div>
          )
        ) : null}
      </div>
      <div className="flex flex-col items-center justify-between gap-2.5 md:flex-row">
        <div className="flex items-center gap-2.5">
          <DetailCreatedBy address={data.creator.address as `0x${string}`} />
          {inThisWeek ? (
            <div className="font-geneva text-xs">
              <CountdownTimer endTime={data.ending} />
            </div>
          ) : (
            <span
              className={combineClass(
                isEnded ? "bg-[#CCC]" : "bg-9yellow",
                "px-1 py-0.5 font-geneva text-[10px] uppercase text-9black md:text-xs",
              )}
            >
              {isEnded ? "Ended" : "End Date"}:{" "}
              {new Date(
                data.ending.toString().length === 10
                  ? data.ending * 1000
                  : data.ending,
              ).toDateString()}
            </span>
          )}
        </div>
        {isConcluded || isEnded ? (
          <span className="bg-[#CCC] p-2 font-chicago text-xs text-[#808080]">
            Campaign {isConcluded ? "Concluded" : "Ended"}
          </span>
        ) : (
          <div className="flex flex-col items-center gap-2.5 md:flex-row">
            <WatchlistButton data={data} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        {subHeaderMap
          .filter((i) => i.show)
          .map((i) => (
            <HeaderBox
              key={i.title}
              title={i.title}
              value={i.value}
              shrink={i.shrink}
              rightComp={i.rightComp}
            />
          ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title="MANAGE LIQUIDITY"
      >
        <ManageLiquidityDialog data={data} />
      </Modal>
    </div>
  );
}
