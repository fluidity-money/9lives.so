"use client";
import { ConnectButton as ThirdWebButton } from "thirdweb/react";
import { thirdwebClient } from "@/config/app";
import appConfig from "@/config";
import { superpositionTestnet } from "@/config/chains";

export default function ConnectButton() {
  return (
    <ThirdWebButton
      client={thirdwebClient}
      chain={superpositionTestnet}
      appMetadata={appConfig.thirdwebMetadata}
      accountAbstraction={{
        chain: superpositionTestnet,
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
          borderColor: "transparent",
          minWidth: "auto",
          border: "none",
        },
      }}
      connectButton={{
        label: "Connect Wallet",
        style: {
          color: "#0c0c0c",
          textDecoration: "underline",
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
