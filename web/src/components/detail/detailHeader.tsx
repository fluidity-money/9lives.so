import Image from "next/image";
import CatImage from "#/images/cat.png";
import Button from "@/components/themed/button";
import { CampaignListQuery } from "@/gql/graphql";

export default function DetailHeader({
  data,
}: {
  data: CampaignListQuery["campaigns"][number];
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          alt="tldr"
          width={80}
          height={80}
          className="rounded-md"
          src={CatImage}
        />
        <h1 className="text-3xl font-bold">{data.name}</h1>
      </div>
      <Button onClick={() => window.alert("You clicked the button!")}>
        Watchlist
      </Button>
    </div>
  );
}
