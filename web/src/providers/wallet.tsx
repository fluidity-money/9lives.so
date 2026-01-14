"use client";

import { wagmiAdapter } from "@/config/wagmi";
import { createAppKit } from "@reown/appkit/react";
import { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import clientEnv from "../config/clientEnv";
import config from "@/config";
import allChains, { destinationChain } from "@/config/chains";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { superposition: _, ...otherChains } = allChains;
createAppKit({
  adapters: [wagmiAdapter],
  projectId: clientEnv.NEXT_PUBLIC_THIRDWEB_ID,
  networks: [destinationChain, ...Object.values(otherChains)],
  defaultNetwork: destinationChain,
  metadata: {
    name: config.metadata.title,
    description: config.metadata.description,
    // url: config.metadata.metadataBase.href,
    url: "http://localhost:3000",
    icons: ["https://9lives.so/favicon.ico?favicon.96b1cd7b.ico"],
  },
  features: {
    analytics: true,
  },
  themeMode: "light",
});

function WalletProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      {children}
    </WagmiProvider>
  );
}

export default WalletProvider;
