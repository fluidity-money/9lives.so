import Image from "next/image";
import CatImage from "#/images/cat.png";
import { Campaign } from "@/gql/graphql";
import Link from "next/link";

interface CampaignItemHeaderProps {
  name: Campaign["name"];
  identifier: Campaign["identifier"];
}
export default function CampaignItemHeader({
  name,
  identifier,
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
    </div>
  );
}
