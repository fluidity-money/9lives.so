import useClaimAllFees from "@/hooks/useClaimAllFees";
import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import Button from "./themed/button";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function ClaimFeesButton({
  addresses,
  multiple = false,
}: {
  addresses: string[];
  multiple?: boolean;
}) {
  const [isClaiming, setIsClaiming] = useState(false);
  const account = useActiveAccount();
  const { claim } = useClaimAllFees();
  const { connect } = useConnectWallet();

  const handleClick = async () => {
    try {
      if (!account) return connect();
      setIsClaiming(true);
      await claim(addresses, account);
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
