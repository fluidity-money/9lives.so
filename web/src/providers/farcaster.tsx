import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useUserStore } from "@/stores/userStore";
import useConnectWallet from "@/hooks/useConnectWallet";

export default function FarcasterProvider() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const setIsInMiniApp = useUserStore((s) => s.setIsInMiniApp);
  const setFarcasterCtx = useUserStore((s) => s.setFarcasterCtx);
  const { connect } = useConnectWallet();
  useEffect(() => {
    const load = async () => {
      // @ts-expect-error
      const isInMiniApp = await sdk.isInMiniApp(1000);
      if (isInMiniApp) {
        setIsInMiniApp(true);
        await sdk.actions.ready();
        setFarcasterCtx(await sdk.context);
        await sdk.back.enableWebNavigation();
        setIsSDKLoaded(true);
      }
    };
    if (!isSDKLoaded) {
      load();
    }
  }, [isSDKLoaded, connect, setIsInMiniApp, setFarcasterCtx]);
  return null;
}
