import Image from "next/image";
import Link from "next/link";
import { Campaign } from "@/types";
import config from "@/config";
interface CampaignItemHeaderProps {
  name: Campaign["name"];
  identifier: Campaign["identifier"];
  picture: Campaign["picture"];
  isDppm: Campaign["isDppm"];
  priceMetadata: Campaign["priceMetadata"];
}
export default function CampaignItemHeader({
  name,
  identifier,
  picture,
  isDppm,
  priceMetadata,
}: CampaignItemHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={`/campaign/${identifier}`}
        className="flex items-center gap-2"
      >
        {picture || isDppm ? (
          <Image
            src={
              priceMetadata
                ? config.simpleMarkets[priceMetadata.baseAsset].logo
                : (picture ?? "")
            }
            width={40}
            height={40}
            alt={name}
          />
        ) : null}
        <h4 className="font-chicago text-sm font-bold">{name}</h4>
      </Link>
    </div>
  );
}
