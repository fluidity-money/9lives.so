import { destinationChain } from "@/config/chains";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useSwitchChain } from "wagmi";


export default function useCheckAndSwitchChain() {
  const { chainId } = useAppKitNetwork();
  const { mutateAsync: switchChain } = useSwitchChain();

  async function checkAndSwitchChain() {
    if (!chainId) throw new Error("No chain is detected");

    if (destinationChain.id !== chainId) {
      await switchChain({ chainId: destinationChain.id });
    }
  }

  return { checkAndSwitchChain };
}
