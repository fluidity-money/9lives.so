import Image from "next/image";
import Link from "next/link";
import PixelRing from "#/icons/pixel-ring.svg";
import { Campaign } from "@/types";
interface CampaignItemHeaderProps {
  name: Campaign["name"];
  identifier: Campaign["identifier"];
  picture: Campaign["picture"];
  solo?: boolean;
  soloRatio?: number;
}
export default function CampaignItemHeader({
  name,
  identifier,
  picture,
  solo,
  soloRatio,
}: CampaignItemHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={`/campaign/${identifier}`}
        className="flex items-center gap-2"
      >
        {picture ? (
          <Image src={picture} width={40} height={40} alt={name} />
        ) : null}
        <h4 className="font-chicago text-sm font-bold">{name}</h4>
      </Link>
      {solo && soloRatio && (
        <div className="relative flex size-14 shrink-0 items-center justify-center">
          <span className="z-20 font-chicago text-xs font-normal text-gray-500">
            {soloRatio}%
          </span>
          <div
            className="absolute z-0 size-[70%] rounded-full"
            style={{
              background: `conic-gradient(transparent ${100 - soloRatio}%, ${"#ff000052"} 0)`,
            }}
          />
          <Image src={PixelRing} fill={true} alt="pixel-ring z-10" />
        </div>
      )}
    </div>
  );
}
