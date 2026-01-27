import Link from "next/link";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { Campaign } from "@/types";
import formatFusdc from "@/utils/format/formatUsdc";
import CountdownTimer from "../countdownTimer";
import ClaimFeesButton from "../claimFeesButton";
import config from "@/config";
import useCheckClaims from "@/hooks/useCheckClaims";

export default function CampaignTableItem({
  data,
  address,
}: {
  data: Campaign;
  address?: string;
}) {
  const left = data.ending - Date.now();
  const inThisWeek = config.weekDuration >= left && left > 0;
  const { data: claims, isSuccess } = useCheckClaims(
    [data.poolAddress],
    address,
  );
  const unclaimedFees = claims?.result?.[0];
  const displayClaimButton =
    isSuccess && !!unclaimedFees && unclaimedFees > BigInt(0);

  return (
    <tr>
      <td className="flex items-center gap-1 p-2">
        {data?.picture ? (
          <Image
            src={data.picture}
            alt={data.name}
            width={40}
            height={40}
            className="size-10 border border-9black"
          />
        ) : null}
        <div className="flex flex-col gap-1 p-1">
          <Link href={`/v1/campaign/${data.identifier}`}>
            <p className="font-chicago text-xs font-bold underline">
              {data.name}
            </p>
          </Link>
        </div>
      </td>
      <td>
        {inThisWeek ? (
          <div className="font-geneva text-xs">
            <CountdownTimer endTime={data.ending} />
          </div>
        ) : (
          <span
            className={combineClass("p-0.5 font-chicago text-xs uppercase")}
          >
            {new Date(data.ending).toLocaleString("default", {
              year: "2-digit",
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </td>
      <td>
        <span className="font-chicago text-xs">
          ${formatFusdc(data.totalVolume, 2)}
        </span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          ${formatFusdc(unclaimedFees ?? 0, 2)}
        </span>
      </td>
      <td>
        <div className="flex items-center justify-end">
          {displayClaimButton && (
            <ClaimFeesButton addresses={[data.poolAddress]} />
          )}
        </div>
      </td>
    </tr>
  );
}
