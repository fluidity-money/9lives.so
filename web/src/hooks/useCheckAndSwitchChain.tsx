import { destinationChain } from "@/config/chains";
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";

export default function useCheckAndSwitchChain() {
  const chain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  async function checkAndSwitchChain() {
    if (!chain) throw new Error("No chain is detected");

    if (destinationChain.id !== chain.id) {
      await switchChain(destinationChain);
    }
  }

  return { checkAndSwitchChain };
}
