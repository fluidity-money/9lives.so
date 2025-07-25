import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { useUserStore } from "@/stores/userStore";
import useConnectWallet from "@/hooks/useConnectWallet";
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
        await sdk.actions.ready();
        if (sdk.wallet) {
          connect(isInMiniApp);
        }
        setIsSDKLoaded(true);
      }
    };
    if (!isSDKLoaded) {
      load();
    }
  }, [isSDKLoaded, connect, setIsInMiniApp, setFarcasterCtx]);
  return null;
}
