import { track, EVENTS } from "@/utils/analytics";
import { useCallback, useEffect, useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export default function useConnectWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const handleConnect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await open();
    } catch (error) {
      console.error("Failed to track wallet connection:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [open]);
  useEffect(() => {
    if (isConnected && address) {
      track(EVENTS.WALLET_CONNECT, { walletAddress: address });
    }
  }, [isConnected, address]);
  return { connect: handleConnect, isConnecting };
}
