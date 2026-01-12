import useLiquidity from "@/hooks/useLiquidity";
import Button from "./themed/button";
import { useState } from "react";
import formatFusdc from "@/utils/format/formatUsdc";

export default function ClaimLiquidityDialog({
  unclaimedRewards,
  tradingAddr,
  campaignId,
}: {
  unclaimedRewards: bigint;
  tradingAddr: `0x${string}`;
  campaignId: `0x${string}`;
}) {
  const [isClaiming, setIsClaiming] = useState(false);
  const { claim } = useLiquidity({ tradingAddr, campaignId });

  const handleClick = async () => {
    try {
      setIsClaiming(true);
      await claim();
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-col gap-4 rounded-[3px] border-[1.5px] border-9black bg-[#fafafa] p-5 text-xs shadow-9liqCard md:flex">
        <h3 className="font-chicago text-2xl">
          {formatFusdc(unclaimedRewards, 2)}
        </h3>
        <p className="text-center font-chicago text-xs">
          Your liquidity has generated these fee rewards so far.
        </p>
      </div>
      <Button
        intent={"cta"}
        title={isClaiming ? "Claiming..." : "Claim Liquidity & Rewards"}
        onClick={handleClick}
        disabled={isClaiming}
        size={"large"}
      />
    </div>
  );
}
