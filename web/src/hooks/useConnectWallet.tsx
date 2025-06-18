import appConfig from "@/config";
import { useConnectModal } from "thirdweb/react";
import { track, EVENTS } from "@/utils/analytics";
import { Wallet } from "thirdweb/wallets";
import { useCallback } from "react";

export default function useConnectWallet() {
  const { connect, isConnecting } = useConnectModal();
  const handleConnect = useCallback(async () => {
    let result: Wallet | null = null;
    try {
      result = await connect({
        client: appConfig.thirdweb.client,
        chains: Object.values(appConfig.chains),
        appMetadata: appConfig.thirdweb.metadata,
        wallets: appConfig.thirdweb.wallets,
        theme: appConfig.thirdweb.theme,
        showThirdwebBranding:
          appConfig.thirdweb.connectModal.showThirdwebBranding,
        showAllWallets: false,
        walletConnect: {
          projectId: appConfig.NEXT_PUBLIC_THIRDWEB_ID,
        },
      });
    } catch (error) {
      if (!error) console.error("Connection error:", error);
    }
    try {
      const address = await result?.getAccount();
      if (address) {
        track(EVENTS.WALLET_CONNECT, { wallet: address });
      }
    } catch (error) {
      console.error("Failed to track wallet connection:", error);
    }
  }, [connect]);
  return { connect: handleConnect, isConnecting };
}
