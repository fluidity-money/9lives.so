import { createConfig, EVM } from "@lifi/sdk";
import { viemAdapter } from "thirdweb/adapters/viem";
import config from "@/config";
import { useEffect } from "react";
import { useActiveWallet, useSwitchActiveWalletChain } from "thirdweb/react";

export default function LiFiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallet = useActiveWallet();
  const switchChainThirdweb = useSwitchActiveWalletChain();
  useEffect(() => {
    if (wallet) {
      const walletClient = viemAdapter.wallet.toViem({
        client: config.thirdweb.client,
        chain: config.destinationChain,
        wallet,
      });
      createConfig({
        integrator: "superposition",
        providers: [
          EVM({
            getWalletClient: async () => walletClient as any,
            switchChain: async (chainId) => {
              const chainList = Object.values(config.chains);
              const targetChain = chainList.find((c) => c.id === chainId);
              switchChainThirdweb(targetChain ?? config.destinationChain);
              return viemAdapter.wallet.toViem({
                client: config.thirdweb.client,
                chain: targetChain ?? config.destinationChain,
                wallet,
              }) as any;
            },
          }),
        ],
      });
    }
  }, [wallet, switchChainThirdweb]);
  return children;
}
