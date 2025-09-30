import useClaimAllFees from "@/hooks/useClaimAllFees";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import Button from "./themed/button";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function ClaimFeesButton({ address }: { address: string }) {
  const [isClaiming, setIsClaiming] = useState(false);
  const account = useActiveAccount();
  const { claim } = useClaimAllFees();
  const { connect } = useConnectWallet();

  const handleClick = async () => {
    try {
      if (!account) return connect();
      setIsClaiming(true);
      await claim([address], account);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      title={isClaiming ? "Claiming..." : "Claim"}
      disabled={isClaiming}
      intent={"cta"}
    />
  );
}
