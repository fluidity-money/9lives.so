import Image from "next/image";
import WatchlistButton from "../watchlistButton";
import { CampaignDetail } from "@/types";
import ActiveIndicator from "#/images/active-indicator.svg";
import InactiveIndicator from "#/images/inactive-indicator.svg";
import { combineClass } from "@/utils/combineClass";
import SadFaceIcon from "#/icons/sad-face.svg";
import UsdIcon from "#/icons/usd.svg";
import DetailCreatedBy from "./detailCreatedBy";
import formatFusdc from "@/utils/format/formatUsdc";
import CountdownTimer from "../countdownTimer";
import { useEffect, useState } from "react";
import Modal from "../themed/modal";
import ManageLiquidityDialog from "../manageLiquidityDialog";
import Button from "../themed/button";
import ClaimFeesButton from "../claimFeesButton";
import useAPY from "@/hooks/useAPY";
import useUserLiquidity from "@/hooks/useUserLiquidity";
import useLiquidity from "@/hooks/useLiquidity";
import { HeaderBox } from "./detailHeaderBox";
import DetailCurrentPriceBox from "./detailCurrentPriceBox";
import config from "@/config";
import PointsIndicator from "../pointsIndicator";
import { useAppKitAccount } from "@reown/appkit/react";
import useCheckClaims from "@/hooks/useCheckClaims";

export default function DetailHeader({
  data,
  isEnded,
  isConcluded,
  notStarted,
}: {
  data: CampaignDetail;
  isEnded: boolean;
  isConcluded: boolean;
  notStarted: boolean;
}) {
  const account = useAppKitAccount();
  const left = data.ending - Date.now();
  const inThisWeek = config.weekDuration >= left && left > 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { data: claims, isSuccess: checkIsSuccess } = useCheckClaims(
    [data.poolAddress],
    account.address,
  );
  const unclaimedFees = claims?.result?.[0];
  const displayCreatorFees =
    data.creator.address.toLowerCase() === account?.address?.toLowerCase() &&
    checkIsSuccess &&
    !!unclaimedFees &&
    unclaimedFees > BigInt(0);
  const APY = useAPY(data.poolAddress, data.liquidityVested);
  const { data: userLiquidity, isSuccess } = useUserLiquidity({
    address: account?.address,
    tradingAddr: data.poolAddress,
  });
  const [unclaimedRewards, setUnclaimedRewards] = useState(BigInt(0));
  const { checkLpRewards } = useLiquidity({
    tradingAddr: data.poolAddress,
    campaignId: data.identifier,
  });

  const displayWithdrawBtn =
    isSuccess &&
    Number(userLiquidity) > 0 &&
    Number(data.liquidityVested) > 1e6;
  const displayClaimBtn = !!unclaimedRewards && unclaimedRewards > BigInt(0);

  useEffect(() => {
    (async function () {
      if (data.isDppm || address === undefined) return;
      const fees = await checkLpRewards(account.address);
      if (fees && BigInt(fees) > BigInt(0)) {
        setUnclaimedRewards(fees);
      }
    })();
  }, [account.address, checkLpRewards, data.isDppm]);
  const LiquidityComp = () => (
    <div className="flex flex-row gap-1">
      {data.winner ? null : (
        <Button
          title="+"
          intent={"yes"}
          onClick={() => {
            setTabIndex(0);
            setIsModalOpen(true);
          }}
        />
      )}
      {!data.winner && displayWithdrawBtn ? (
        <Button
          title="-"
          intent={"no"}
          onClick={() => {
            setTabIndex(1);
            setIsModalOpen(true);
          }}
        />
      ) : null}
      {data.winner && displayClaimBtn ? (
        <Button
          title="Claim"
          intent={"cta"}
          onClick={() => {
            setTabIndex(0);
            setIsModalOpen(true);
          }}
        />
      ) : null}
    </div>
  );

  const subHeaderMap = [
    {
      title: data.isDpm ? "TVL" : "Total Vol.",
      value: `$${formatFusdc((data.isDppm ? 2e6 : 0) + data.totalVolume, 2)}`,
      show: true,
    },
    {
      title: "Total Liq.",
      value: `$${formatFusdc(data.liquidityVested, 2)}`,
      show: !(data.isDpm || data.isDppm),
      rightComp: <LiquidityComp />,
    },
    {
      title: "Creator Fees",
      value: `$${formatFusdc(unclaimedFees ?? 0, 2)}`,
      show: !(data.isDpm || data.isDppm) && displayCreatorFees,
      rightComp: <ClaimFeesButton addresses={[data.poolAddress]} />,
      shrink: true,
    },
    {
      title: "APY",
      value: `${+(APY * 100).toFixed(2)}%`,
      show: !(data.isDpm || data.isDppm) && !!APY && !data.winner,
      shrink: true,
    },
  ];

  // useEffect(() => {
  //   if (
  //     data.creator.address.toLowerCase() === account?.address?.toLowerCase()
  //   ) {
  //     (async () => {
  //       const unclaimedFees = await checkClaimFees(data.poolAddress);
  //       if (unclaimedFees > BigInt(0)) {
  //         setUnclaimedFees(unclaimedFees);
  //       }
  //     })();
  //   }
  // }, [account.address, checkClaimFees, data.creator.address, data.poolAddress]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          {data.picture || data.isDppm ? (
            <Image
              alt=""
              width={60}
              height={60}
              className="size-[60px] border border-9black"
              src={
                data.priceMetadata
                  ? config.simpleMarkets[data.priceMetadata.baseAsset].logo
                  : (data.picture ?? "")
              }
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
          {notStarted ? (
            <span
              className={combineClass(
                isEnded ? "bg-[#CCC]" : "bg-9yellow",
                "px-1 py-0.5 font-geneva text-[10px] uppercase text-9black md:text-xs",
              )}
            >
              {"Will start on: "}
              {new Date(data.starting).toLocaleString("default", {
                year: data.isDppm ? undefined : "numeric",
                month: "short",
                day: "2-digit",
                hour: data.isDppm ? "numeric" : undefined,
                minute: data.isDppm ? "2-digit" : undefined,
              })}
            </span>
          ) : (
            <>
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
                  {new Date(data.ending).toLocaleString("default", {
                    year: data.isDppm ? undefined : "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: data.isDppm ? "numeric" : undefined,
                    hourCycle: data.isDppm ? "h24" : undefined,
                    minute: data.isDppm ? "2-digit" : undefined,
                  })}
                </span>
              )}
              {isEnded ? null : (
                <div className="font-geneva text-xs">
                  <PointsIndicator
                    starting={data.starting}
                    ending={data.ending}
                    variant="only_multiplier"
                  />
                </div>
              )}
            </>
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
      <div className="flex flex-wrap items-center gap-2.5">
        {data.isDppm && data.priceMetadata ? (
          <>
            <HeaderBox
              title={"Base Price"}
              value={`$${data.priceMetadata?.priceTargetForUp}`}
            />
            <DetailCurrentPriceBox
              isEnded={isEnded}
              starting={data.starting}
              ending={data.ending}
              symbol={data.priceMetadata.baseAsset}
            />
          </>
        ) : null}
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
        <ManageLiquidityDialog
          data={data}
          APY={APY}
          tabIndex={tabIndex}
          unclaimedRewards={unclaimedRewards}
          displayClaimBtn={displayClaimBtn}
          displayWithdrawBtn={displayWithdrawBtn}
          userLiquidity={userLiquidity}
        />
      </Modal>
    </div>
  );
}
