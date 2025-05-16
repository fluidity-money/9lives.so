import useLiquidity from "@/hooks/useLiquidity";
import Button from "./themed/button";
import { useActiveAccount } from "thirdweb/react";
import useConnectWallet from "@/hooks/useConnectWallet";
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
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const handleClick = async () => {
    try {
      if (!account) return connect();
      setIsClaiming(true);
      await claim(account);
    } finally {
      setIsClaiming(false);
    }
  };
  return (
    <Button
      intent={"cta"}
      title={isClaiming ? "Claiming..." : "Claim Provider Rewards"}
      onClick={handleClick}
      disabled={isClaiming}
    />
  );
}
