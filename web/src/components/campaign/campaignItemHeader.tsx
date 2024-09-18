import Image from "next/image";
import CatImage from "#/images/cat.png";
import { Campaign } from "@/gql/graphql";
import Link from "next/link";
import PixelRing from "#/icons/pixel-ring.svg";
interface CampaignItemHeaderProps {
  name: Campaign["name"];
  identifier: Campaign["identifier"];
  solo?: boolean;
  soloRatio?: number;
}
export default function CampaignItemHeader({
  name,
  identifier,
  solo,
  soloRatio,
}: CampaignItemHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Image src={CatImage} width={40} height={40} alt={name} />
        <Link href={`/event?id=${identifier}`}>
          <h4 className="font-chicago text-sm font-bold">{name}</h4>
        </Link>
      </div>
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
