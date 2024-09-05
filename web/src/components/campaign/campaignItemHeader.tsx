import Image from "next/image";
import CatImage from "#/images/cat.png";
import { Campaign } from "@/gql/graphql";

interface CampaignItemHeaderProps {
  name: Campaign["name"];
}
export default function CampaignItemHeader({ name }: CampaignItemHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={CatImage}
        width={40}
        height={40}
        className="rounded-md"
        alt={name}
      />
      <h4 className="text-sm font-bold">{name}</h4>
    </div>
  );
}
