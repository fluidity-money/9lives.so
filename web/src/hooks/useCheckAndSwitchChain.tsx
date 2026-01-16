import { destinationChain } from "@/config/chains";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useSwitchChain } from "wagmi";

export default function useCheckAndSwitchChain() {
  const { chainId } = useAppKitNetwork();
  const { mutateAsync: switchChain } = useSwitchChain();

  async function checkAndSwitchChain(
    targetChainId: number = destinationChain.id,
  ) {
    if (!chainId) throw new Error("No chain is detected");

    if (targetChainId !== chainId) {
      await switchChain({ chainId: targetChainId });
    }
  }

  return { checkAndSwitchChain };
}
