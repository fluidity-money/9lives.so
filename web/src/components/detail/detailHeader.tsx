import Image from "next/image";
import ElectionImg from "#/images/usa-election.webp";
import WatchlistButton from "../watchlistButton";
import { Campaign } from "@/types";
import useInvestedAmount from "@/hooks/useInvestedAmount";

export default function DetailHeader({ data }: { data: Campaign }) {
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
          <h1 className="font-chicago text-2xl">{data.name}</h1>
          <span className="font-geneva text-sm uppercase leading-3 tracking-wide text-[#808080]">
            {investedAmount} fUSDC Vol.
          </span>
        </div>
      </div>
      <WatchlistButton id={data.identifier} />
    </div>
  );
}
