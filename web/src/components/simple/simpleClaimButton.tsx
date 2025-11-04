import { Outcome } from "@/types";
import { useState } from "react";
import Button from "../themed/button";
import useConnectWallet from "@/hooks/useConnectWallet";
import { useActiveAccount } from "thirdweb/react";
import useDppmClaimAll from "@/hooks/useDppmClaimAll";

export default function SimpleClaimButton({
  tradingAddr,
  totalRewards,
}: {
  tradingAddr: `0x${string}`;
  totalRewards: number;
}) {
  const [isClaiming, setIsClaiming] = useState(false);
  const account = useActiveAccount();
  const { connect, isConnecting } = useConnectWallet();
  const { claimAll } = useDppmClaimAll({ tradingAddr });
  async function handleClaim() {
    if (!account) return connect();
    try {
      setIsClaiming(true);
      await claimAll(account);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <Button
      disabled={isConnecting || isClaiming}
      title={
        isClaiming ? "Claiming..." : `Claim Your Rewards: $${totalRewards}`
      }
      className="w-full uppercase"
      intent="yes"
      size="xlarge"
      onClick={handleClaim}
    />
  );
}
