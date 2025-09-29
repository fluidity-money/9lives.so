import useClaimAllFees from "@/hooks/useClaimAllFees";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import Button from "./themed/button";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function ClaimFeesButton({ address }: { address: string }) {
  const [isClaiming, setIsClaiming] = useState(false);
  const account = useActiveAccount();
  const { claim, checkClaimFees } = useClaimAllFees();
  const { connect } = useConnectWallet();
  const [unclaimedFees, setUnclaimedFees] = useState(BigInt(0));
  const displayBtn = unclaimedFees > BigInt(0);

  const handleClick = async () => {
    try {
      if (!account) return connect();
      setIsClaiming(true);
      await claim([address], account);
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    (async function () {
      if (!account) return;
      const fees = await checkClaimFees(address, account);
      if (fees && BigInt(fees) > BigInt(0)) {
        setUnclaimedFees(fees);
      }
    })();
  }, [account, checkClaimFees]);

  if (displayBtn) {
    return (
      <Button
        onClick={handleClick}
        title={isClaiming ? "Claiming..." : "Claim Fees"}
        disabled={isClaiming}
        intent={"cta"}
      />
    );
  }
}
