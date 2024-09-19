"use client";
import { ConnectButton as ThirdWebButton } from "thirdweb/react";
import { useActiveWalletChain } from "thirdweb/react";
import appConfig from "@/config";
import { allChains } from "@/config/chains";
import { ThirdwebClient } from "thirdweb";

export default function ConnectButton() {
  const activeChain = useActiveWalletChain();

  return (
    <ThirdWebButton
      client={appConfig.thirdwebClient as ThirdwebClient}
      chains={allChains}
      appMetadata={appConfig.thirdwebMetadata}
      accountAbstraction={{
        chain: activeChain ?? allChains[0],
        sponsorGas: appConfig.thirdwebSponsorGas,
      }}
      theme={"light"}
      detailsButton={{
        style: {
          backgroundColor: "transparent",
          fontFamily: "var(--font-chicago)",
          height: 40,
          fontSize: 12,
          lineHeight: 16,
        },
      }}
      connectButton={{
        label: "Connect Wallet",
        style: {
          color: "#0c0c0c",
          backgroundColor: "transparent",
          fontFamily: "var(--font-chicago)",
          height: 40,
          fontSize: 12,
          lineHeight: 16,
        },
      }}
      connectModal={{
        showThirdwebBranding: false,
      }}
    />
  );
}
