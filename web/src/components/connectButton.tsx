import { ConnectButton as ThirdWebButton } from "thirdweb/react";
import { config } from "@/config";

export default function ConnectButton() {
  return (
    <ThirdWebButton
      client={config.thirdweb.client}
      chain={config.thirdweb.chain}
      appMetadata={config.thirdweb.appMetadata}
      accountAbstraction={config.thirdweb.accountAbstraction}
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
