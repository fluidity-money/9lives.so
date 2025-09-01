import Image from "next/image";
import Link from "next/link";
import PixelRing from "#/icons/pixel-ring.svg";
import { Campaign, Outcome } from "@/types";
import getAmmPrices from "@/utils/getAmmPrices";
import { useMemo } from "react";
import posthog from "posthog-js";
import useFeatureFlag from "@/hooks/useFeatureFlag";
interface CampaignItemHeaderProps {
  name: Campaign["name"];
  identifier: Campaign["identifier"];
  picture: Campaign["picture"];
  outcomes: Outcome[];
  isYesNo: boolean;
  shares: ({
    shares: string;
    identifier: string;
  } | null)[];
}
export default function CampaignItemHeader({
  name,
  identifier,
  picture,
  isYesNo,
  shares,
  outcomes,
}: CampaignItemHeaderProps) {
  const prices = useMemo(() => getAmmPrices(shares), [shares]);
  const yesPrice = prices?.get(outcomes[0].identifier);
  const isOddsEnabled = useFeatureFlag("display odds on campaign items");
  const experimentIsCircular =
    posthog.getFeatureFlag("display-odds-visual") === "circular";
  const displayOdd =
    isOddsEnabled && isYesNo && yesPrice && experimentIsCircular;
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
      {displayOdd ? (
        <div className="relative flex size-14 shrink-0 items-center justify-center">
          <span className="z-20 font-chicago text-xs font-normal text-gray-500">
            %{+(yesPrice * 100).toFixed(0)}
          </span>
          <div
            className="absolute z-0 size-[70%] rounded-full"
            style={{
              background: `conic-gradient(transparent ${100 - yesPrice * 100}%, ${"#B8F2AA"} 0)`,
            }}
          />
          <Image src={PixelRing} fill={true} alt="pixel-ring z-10" />
        </div>
      ) : null}
    </div>
  );
}
