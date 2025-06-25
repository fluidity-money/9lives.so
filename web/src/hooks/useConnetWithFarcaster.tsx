import { useCallback } from "react";
import config from "@/config";
import { EIP1193 } from "thirdweb/wallets";
import { useActiveWalletChain, useConnect } from "thirdweb/react";
import { sdk } from "@farcaster/frame-sdk";

export default function useConnectWithFarcaster() {
  const { connect } = useConnect();
  const chain = useActiveWalletChain();
  const connectWallet = useCallback(async () => {
    return connect(async () => {
      const wallet = EIP1193.fromProvider({ provider: sdk.wallet.ethProvider });
      await wallet.connect({
        client: config.thirdweb.client,
        chain,
      });
      return wallet;
    });
  }, [connect]);

  return { connectWallet };
}
