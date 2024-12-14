import appConfig from "@/config";
import { useConnectModal } from "thirdweb/react";
import { track, EVENTS } from "@/utils/analytics";

export default function useConnectWallet() {
  const { connect, isConnecting } = useConnectModal();
  const handleConnect = async () => {
    const result = await connect({
      client: appConfig.thirdweb.client,
      chain: appConfig.thirdweb.chain,
      appMetadata: appConfig.thirdweb.metadata,
      wallets: appConfig.thirdweb.wallets,
      theme: appConfig.thirdweb.theme,
      showThirdwebBranding:
        appConfig.thirdweb.connectModal.showThirdwebBranding,
      showAllWallets: false,
    });
    try {
      const address = await result?.getAccount();
      if (address) {
        track(EVENTS.WALLET_CONNECT, { wallet: address });
      }
    } catch (error) {
      console.error('Failed to track wallet connection:', error);
    }
  };
  return { connect: handleConnect, isConnecting };
}
