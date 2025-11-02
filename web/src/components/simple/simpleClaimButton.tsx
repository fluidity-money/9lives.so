import useClaim from "@/hooks/useClaim";
import { Outcome } from "@/types";
import { useState } from "react";
import Button from "../themed/button";
import useConnectWallet from "@/hooks/useConnectWallet";
import { useActiveAccount } from "thirdweb/react";

export default function SimpleClaimButton({
  userPosition,
  winner,
  tradingAddr,
  outcomes,
}: {
  userPosition: {
    id: `0x${string}`;
    shareAddress: `0x${string}`;
    name: string;
    balance: string;
    balanceRaw: bigint;
  };
  winner: Outcome;
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
}) {
  const [isClaiming, setIsClaiming] = useState(false);
  const account = useActiveAccount();
  const { connect, isConnecting } = useConnectWallet();
  const { claim } = useClaim({
    shareAddr: winner.share.address,
    tradingAddr,
    outcomeId: winner.identifier,
    outcomes,
    isDpm: false,
  });
  async function handleClaim() {
    if (!account) return connect();
    try {
      setIsClaiming(true);
      await claim(account, userPosition.balanceRaw);
    } finally {
      setIsClaiming(false);
    }
  }
  const noClaim = !(userPosition.balanceRaw > BigInt(0));

  return (
    <Button
      disabled={noClaim || isConnecting || isClaiming}
      title={
        isClaiming
          ? "Claiming..."
          : noClaim
            ? "No Rewards to Claim"
            : `Claim Your Reward: ${userPosition.balance}`
      }
      className="uppercase"
      intent="yes"
      size="xlarge"
      onClick={handleClaim}
    />
  );
}
