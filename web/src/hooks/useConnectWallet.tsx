import appConfig from "@/config";
import { useConnectModal } from "thirdweb/react";
import { track, EVENTS } from "@/utils/analytics";
import { Wallet } from "thirdweb/wallets";
import { useCallback } from "react";
import { useUserStore } from "@/stores/userStore";
import { farcasterWallet } from "@/providers/farcaster";

export default function useConnectWallet() {
  const { connect, isConnecting } = useConnectModal();
  const isInMiniApp = useUserStore((s) => s.isInMiniApp);
  const handleConnect = useCallback(
    async (initialIsInMiniApp?: boolean) => {
      let result: Wallet | null = null;
      const chains =
        appConfig.NEXT_PUBLIC_CHAIN === "mainnet"
          ? isInMiniApp
            ? Object.values(appConfig.farcasterChains)
            : Object.values(appConfig.chains)
          : [appConfig.destinationChain];
      try {
        result = await connect({
          client: appConfig.thirdweb.client,
          chains,
          appMetadata: appConfig.thirdweb.metadata,
          wallets:
            isInMiniApp || initialIsInMiniApp
              ? [farcasterWallet]
              : appConfig.thirdweb.wallets,
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
          track(EVENTS.WALLET_CONNECT, { walletAddress: address });
        }
      } catch (error) {
        console.error("Failed to track wallet connection:", error);
      }
    },
    [connect, isInMiniApp],
  );
  return { connect: handleConnect, isConnecting };
}
