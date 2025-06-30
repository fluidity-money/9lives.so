import { useEffect, useState } from "react";
import { type Context, sdk } from "@farcaster/frame-sdk";
import { useUserStore } from "@/stores/userStore";
import useConnectWallet from "@/hooks/useConnectWallet";
export default function FarcasterProvider() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const setIsInMiniApp = useUserStore((s) => s.setIsInMiniApp);
  const [_, setContext] = useState<Context.FrameContext>();
  const { connect } = useConnectWallet();
  useEffect(() => {
    const load = async () => {
      const isInMiniApp = await sdk.isInMiniApp();
      if (isInMiniApp) {
        setContext(await sdk.context);
        setIsInMiniApp(true);
        sdk.actions.ready({});
        if (sdk.wallet) {
          connect(isInMiniApp);
        }
      }
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded, connect, setIsInMiniApp]);
  return null;
}
