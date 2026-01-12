import useLiquidity from "@/hooks/useLiquidity";
import Button from "./themed/button";
import { useState } from "react";

export default function ClaimLiquidityButton({
  tradingAddr,
  campaignId,
}: {
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
    <Button
      intent={"cta"}
      title={isClaiming ? "Claiming..." : "Claim Rewards"}
      onClick={handleClick}
      disabled={isClaiming}
    />
  );
}
