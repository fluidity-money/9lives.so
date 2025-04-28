import useSell from "@/hooks/useSell";
import Button from "./themed/button";
import { Outcome } from "@/types";
import { useActiveAccount } from "thirdweb/react";
import { useState } from "react";
import useConnectWallet from "@/hooks/useConnectWallet";
import toast from "react-hot-toast";
export default function SellButton({
  campaignId,
  outcomeId,
  fusdc,
  shareAddr,
  tradingAddr,
  outcomes,
}: {
  campaignId: `0x${string}`;
  outcomeId: `0x${string}`;
  shareAddr: `0x${string}`;
  tradingAddr: `0x${string}`;
  outcomes: Outcome[];
  fusdc: number;
}) {
  const { sell } = useSell({ campaignId, outcomeId, shareAddr, tradingAddr });
  const account = useActiveAccount();
  const { connect } = useConnectWallet();
  const [isSelling, setIsSelling] = useState(false);
  async function handleBuy() {
    try {
      if (!campaignId) toast.error("No campaignId");
      setIsSelling(true);
      await sell(account!, fusdc, outcomes);
    } finally {
      setIsSelling(false);
    }
  }
  const handleClick = !account ? connect : handleBuy;
  return (
    <Button
      title={isSelling ? "Selling..." : "Sell"}
      intent={"no"}
      disabled={isSelling}
      onClick={handleClick}
    />
  );
}
