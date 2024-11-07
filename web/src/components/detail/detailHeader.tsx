import Image from "next/image";
import ElectionImg from "#/images/usa-election.webp";
import WatchlistButton from "../watchlistButton";
import { Campaign } from "@/types";
import useInvestedAmount from "@/hooks/useInvestedAmount";
import ActiveIndicator from "#/images/active-indicator.svg";
import InactiveIndicator from "#/images/inactive-indicator.svg";
import { combineClass } from "@/utils/combineClass";

export default function DetailHeader({
  data,
  isConcluded,
}: {
  data: Campaign;
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          alt="tldr"
          width={60}
          height={60}
          className="border border-9black"
          src={ElectionImg}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Image
              src={isConcluded ? InactiveIndicator : ActiveIndicator}
              alt=""
              className="h-[16px] w-auto"
              height={16}
            />{" "}
            <h1 className="font-chicago text-2xl">{data.name}</h1>
          </div>
          <div className="flex items-center justify-between font-geneva text-[10px] uppercase leading-3 tracking-wide text-[#808080]">
            <div className="flex items-center gap-4">
              <span>
                Created by {data.creator.address.slice(0, 4)}...
                {data.creator.address.slice(-4)}
              </span>
              <span>{investedAmount} fUSDC Vol.</span>
            </div>
            <span
              className={combineClass(
                isConcluded ? "bg-[#CCC]" : "bg-9yellow",
                "px-1 py-0.5 text-9black",
              )}
            >
              End: {new Date(data.ending || 1730803847000).toDateString()}
            </span>
          </div>
        </div>
      </div>
      <WatchlistButton id={data.identifier} />
    </div>
  );
}
