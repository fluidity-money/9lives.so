import Image from "next/image";
import CatImage from "#/images/cat.png";
import { Campaign } from "@/gql/graphql";
import Link from "next/link";

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
    <div className="flex items-center gap-2">
      <Image
        src={CatImage}
        width={40}
        height={40}
        className="rounded-md"
        alt={name}
      />
      <Link href={`/event?id=${identifier}`}>
        <h4 className="text-sm font-bold">{name}</h4>
      </Link>
      {solo && soloRatio && (
        <span className="relative ml-1 flex items-center justify-center text-xs font-bold text-gray-500">
          {soloRatio}%
          <div
            className="absolute z-[-1] size-10 rounded-full border-2 border-gray-200"
            style={{
              background: `conic-gradient(transparent ${100 - soloRatio}%, ${"#ff000052"} 0)`,
            }}
          />
        </span>
      )}
    </div>
  );
}
