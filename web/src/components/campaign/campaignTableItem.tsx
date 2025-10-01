import Link from "next/link";
import Image from "next/image";
import { combineClass } from "@/utils/combineClass";
import { Campaign } from "@/types";
import formatFusdc from "@/utils/formatFusdc";
import { CountdownTimer } from "../countdownTimer";
import ClaimFeesButton from "../claimFeesButton";
import { useEffect, useState } from "react";
import useClaimAllFees from "@/hooks/useClaimAllFees";
import { Account } from "thirdweb/wallets";

export default function CampaignTableItem({
  data,
  account,
}: {
  data: Campaign;
  account?: Account;
}) {
  const left = data.ending - Math.floor(Date.now() / 1000);
  const weekDuration = 60 * 60 * 24 * 7;
  const inThisWeek = weekDuration >= left && left > 0;
  const [unclaimedFees, setUnclaimedFees] = useState(BigInt(0));
  const { checkClaimFees } = useClaimAllFees();
  const displayClaimButton = unclaimedFees > BigInt(0);

  useEffect(() => {
    if (account) {
      (async () => {
        const unclaimedFees = await checkClaimFees(data.poolAddress, account);
        if (unclaimedFees > BigInt(0)) {
          setUnclaimedFees(unclaimedFees);
        }
      })();
    }
  }, [account]);

  return (
    <tr>
      <td className="flex items-center">
        {data?.picture ? (
          <Image
            src={data.picture}
            alt={data.name}
            className="size-10 border border-9black"
          />
        ) : null}
        <div className="flex flex-col gap-1 p-1">
          <Link href={`/campaign/${data.identifier}`}>
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
            {new Date(data.ending * 1000).toLocaleString("default", {
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
        {displayClaimButton && <ClaimFeesButton address={data.poolAddress} />}
      </td>
    </tr>
  );
}
