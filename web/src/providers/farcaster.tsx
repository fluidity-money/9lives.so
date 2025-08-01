import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useUserStore } from "@/stores/userStore";
import useConnectWallet from "@/hooks/useConnectWallet";
import { EIP1193 } from "thirdweb/wallets";

export const farcasterWallet = EIP1193.fromProvider({
  provider: sdk.wallet.ethProvider,
});

export default function FarcasterProvider() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const setIsInMiniApp = useUserStore((s) => s.setIsInMiniApp);
  const setFarcasterCtx = useUserStore((s) => s.setFarcasterCtx);
  const { connect } = useConnectWallet();
  useEffect(() => {
    const load = async () => {
      const isInMiniApp = await sdk.isInMiniApp();
      if (isInMiniApp) {
        setIsInMiniApp(true);
        setFarcasterCtx(await sdk.context);
        if (sdk.wallet) {
          await connect(isInMiniApp);
        }
        await sdk.actions.ready();
        setIsSDKLoaded(true);
      }
    };
    if (!isSDKLoaded) {
      load();
    }
  }, [isSDKLoaded, connect, setIsInMiniApp, setFarcasterCtx]);
  return null;
}
