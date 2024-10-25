import Image from "next/image";
import ElectionImg from "#/images/usa-election.webp";
import WatchlistButton from "../watchlistButton";
import { Campaign } from "@/types";

export default function DetailHeader({ data }: { data: Campaign }) {
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
        <h1 className="font-chicago text-2xl">{data.name}</h1>
      </div>
      <WatchlistButton id={data.identifier} />
    </div>
  );
}
