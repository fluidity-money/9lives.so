import useClaimAllFees from "@/hooks/useClaimAllFees";
import { useState } from "react";
import Button from "./themed/button";
import useConnectWallet from "@/hooks/useConnectWallet";
import { useAppKitAccount } from "@reown/appkit/react";

export default function ClaimFeesButton({
  addresses,
  multiple = false,
}: {
  addresses: string[];
  multiple?: boolean;
}) {
  const [isClaiming, setIsClaiming] = useState(false);
  const account = useAppKitAccount();
  const { claim } = useClaimAllFees();
  const { connect } = useConnectWallet();

  const handleClick = async () => {
    try {
      if (!account.isConnected) return connect();
      setIsClaiming(true);
      await claim(addresses);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      title={isClaiming ? "Claiming..." : multiple ? "Claim All" : "Claim"}
      disabled={isClaiming}
      intent={"cta"}
    />
  );
}
