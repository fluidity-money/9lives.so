import useLiquidity from "@/hooks/useLiquidity";
import formatFusdc from "@/utils/formatFusdc";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Account } from "thirdweb/wallets";
import ClaimLiquidityButton from "../claimLiquidityButton";
import { requestUserLPs } from "@/providers/graphqlClient";

export default function UserLpedCampaignsListItem({
  data: { campaign: data, liquidity },
  account,
}: {
  data: NonNullable<Awaited<ReturnType<typeof requestUserLPs>>[number]>;
  account?: Account;
}) {
  const [unclaimedRewards, setUnclaimedRewards] = useState(BigInt(0));
  const { checkLpRewards } = useLiquidity({
    tradingAddr: data?.poolAddress as `0x${string}`,
    campaignId: data?.identifier as `0x${string}`,
  });
  const displayClaimBtn = unclaimedRewards && unclaimedRewards > BigInt(0);

  useEffect(() => {
    (async function () {
      if (!account) return;
      const fees = await checkLpRewards(account);
      if (fees && BigInt(fees) > BigInt(0)) {
        setUnclaimedRewards(fees);
      }
    })();
  }, [account, checkLpRewards]);

  return (
    <tr>
      <td className="bg-[#DDDDDD] align-baseline">
        <Link href={`/campaign/${data?.identifier}`}>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              {data?.picture ? (
                <Image
                  src={data?.picture}
                  alt={data.name}
                  width={40}
                  height={40}
                  className="size-10 self-start border border-9black bg-9layer"
                />
              ) : null}
              <div className="flex flex-row gap-1">
                <p
                  className={
                    "self-start bg-9layer px-1 py-0.5 font-geneva text-xs uppercase tracking-wide text-9black"
                  }
                >
                  {data?.name}
                </p>
                {data?.winner ? (
                  <span className="bg-9yellow p-0.5 font-geneva text-[10px] uppercase tracking-wide">
                    Concluded
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </Link>
      </td>
      <td className="pl-2">
        <span className="font-chicago text-xs">
          {new Date(data?.ending ? data.ending * 1000 : 0).toLocaleString(
            "default",
            {
              day: "numeric",
              month: "short",
              year: "2-digit",
            },
          )}
        </span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          ${formatFusdc(liquidity ?? "0", 2)}
        </span>
      </td>
      <td>
        <span className="font-chicago text-xs">
          ${formatFusdc(unclaimedRewards ?? "0", 2)}
        </span>
      </td>
      <td>
        {displayClaimBtn ? (
          <div className="flex items-center justify-end">
            <ClaimLiquidityButton
              tradingAddr={data?.poolAddress as `0x${string}`}
              campaignId={data?.identifier as `0x${string}`}
            />
          </div>
        ) : null}
      </td>
    </tr>
  );
}
