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
// import AddLiquidityButton from "../addLiquidityButton";
// import RemoveLiquidityButton from "../removeLiquidityButton";
// import ClaimLiquidityButton from "../claimLiquidityButton";
import ClaimFeesButton from "../claimFeesButton";
import { CountdownTimer } from "../countdownTimer";
import { useState } from "react";
import Modal from "../themed/modal";
import ManageLiquidityDialog from "../manageLiquidityDialog";
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
  const left = data.ending - Math.floor(Date.now() / 1000);
  const weekDuration = 60 * 60 * 24 * 7;
  const inThisWeek = weekDuration >= left && left > 0;
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <DetailCreatedBy
                  address={data.creator.address as `0x${string}`}
                />
              </div>
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
          {inThisWeek && !data.winner ? (
            <div className="font-geneva text-xs">
              <CountdownTimer endTime={data.ending} />
            </div>
          ) : null}
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
      <div className="flex flex-col items-center justify-between gap-2.5 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex shrink-0 flex-row items-center justify-start gap-2.5">
            <span className="font-geneva text-xs uppercase text-[#808080]">
              {isDpm ? "TVL:" : "Volume:"}
            </span>
            <span className="font-chicago text-sm">
              ${formatFusdc(data.totalVolume, 2)}
            </span>
          </div>
          {isDpm ? null : (
            <div className="flex shrink-0 flex-row items-center justify-start gap-2.5">
              <span className="font-geneva text-xs uppercase text-[#808080]">
                Liquidity:
              </span>
              <span className="font-chicago text-sm">
                ${formatFusdc(data.liquidityVested, 2)}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {/* {userLiquidity && Number(userLiquidity) > 0 ? (
            isConcluded ? (
              <ClaimLiquidityButton
                campaignId={data.identifier}
                tradingAddr={data.poolAddress}
              />
            ) : Number(data.liquidityVested) > 1e6 &&
              Number(userLiquidity) > 0 ? (
              <RemoveLiquidityButton
                data={data}
                userLiquidity={userLiquidity}
              />
            ) : null
          ) : null} */}
          {/* {isDpm ? null : (
            <AddLiquidityButton
              data={data}
              name={data.name}
              campaignId={data.identifier}
              tradingAddr={data.poolAddress}
            />
          )} */}
          {/* {isDpm ? null : <ClaimFeesButton address={data.poolAddress} />} */}
        </div>
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
