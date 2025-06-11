import useClaimAllFees from "@/hooks/useClaimAllFees";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import Button from "./themed/button";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function ClaimFeesButton({ address }: { address: string }) {
  const [shouldDisplay, setShouldDisplay] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { claim, displayClaimFeesBtn } = useClaimAllFees();
  const { connect } = useConnectWallet();
  const account = useActiveAccount();

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
      setShouldDisplay(await displayClaimFeesBtn(address, account));
    })();
  }, [account, address, displayClaimFeesBtn]);

  if (!shouldDisplay) return null;

  return (
    <Button
      onClick={handleClick}
      title={isClaiming ? "Claiming..." : "Claim Fees"}
      disabled={isClaiming}
      intent={"cta"}
    />
  );
}
