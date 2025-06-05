import { useCallback, useEffect, useState } from "react";
import { EIP1193 } from "thirdweb/wallets";
import { useConnect } from "thirdweb/react";
import { type Context, sdk } from "@farcaster/frame-sdk";
import config from "@/config";
import { currentChain } from "@/config/chains";

export default function FarcasterProvider() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [_, setContext] = useState<Context.FrameContext>();
  const { connect } = useConnect();
  const connectWallet = useCallback(async () => {
    connect(async () => {
      const wallet = EIP1193.fromProvider({ provider: sdk.wallet.ethProvider });
      await wallet.connect({
        client: config.thirdweb.client,
        chain: currentChain,
      });
      return wallet;
    });
  }, [connect]);
  // useEffect(() => {
  // 	const load = async () => {
  // 		setContext(await sdk.context);
  // 		sdk.actions.ready({});
  // 	};
  // 	if (sdk && !isSDKLoaded) {
  // 		setIsSDKLoaded(true);
  // 		load();
  // 		if (sdk.wallet) {
  // 			connectWallet();
  // 		}
  // 	}
  // }, [isSDKLoaded, connectWallet]);
  return null;
}
