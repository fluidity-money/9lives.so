import Image from "next/image";
import Link from "next/link";
import { Campaign } from "@/types";
interface CampaignItemHeaderProps {
  name: Campaign["name"];
  identifier: Campaign["identifier"];
  picture: Campaign["picture"];
}
export default function CampaignItemHeader({
  name,
  identifier,
  picture,
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
    </div>
  );
}
