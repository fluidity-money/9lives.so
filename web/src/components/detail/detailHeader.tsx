import Image from "next/image";
import WatchlistButton from "../watchlistButton";
import { Campaign } from "@/types";
import useInvestedAmount from "@/hooks/useInvestedAmount";
import ActiveIndicator from "#/images/active-indicator.svg";
import InactiveIndicator from "#/images/inactive-indicator.svg";
import { combineClass } from "@/utils/combineClass";
import SadFaceIcon from "#/icons/sad-face.svg";
import UsdIcon from "#/icons/usd.svg";
import DetailCreatedBy from "./detailCreatedBy";
export default function DetailHeader({
  data,
  isEnded,
  isConcluded,
}: {
  data: Campaign;
  isEnded: boolean;
  isConcluded: boolean;
}) {
  const outcomeIds = data.outcomes.map(
    (outcome) => outcome.identifier as `0x${string}`,
  );
  const investedAmount = useInvestedAmount({
    tradingAddr: data.poolAddress,
    outcomeIds,
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <a href={data.picture} target="_blank" rel="noopener noreferrer">
            <Image
              alt="tldr"
              width={60}
              height={60}
              className="border border-9black"
              src={data.picture}
            />
          </a>
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
          Number(investedAmount) > 0 ? (
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
        ) : (
          <div className="flex shrink-0 flex-col items-center justify-center gap-2.5 md:items-end">
            <span className="font-geneva text-xs uppercase text-[#808080]">
              Total Campaign Vol:
            </span>
            <span className="font-chicago text-xl">$ {investedAmount}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2.5">
        <span
          className={combineClass(
            isEnded ? "bg-[#CCC]" : "bg-9yellow",
            "px-1 py-0.5 font-geneva text-[10px] uppercase text-9black md:text-xs",
          )}
        >
          {isEnded ? "Ended" : "End Date"}:{" "}
          {new Date(data.ending).toDateString()}
        </span>
        {isConcluded || isEnded ? (
          <span className="bg-[#CCC] p-2 font-chicago text-xs text-[#808080]">
            Campaign {isConcluded ? "Concluded" : "Ended"}
          </span>
        ) : (
          <WatchlistButton id={data.identifier} />
        )}
      </div>
    </div>
  );
}
