import { ConnectButton as ThirdWebButton } from "thirdweb/react";
import { config } from "@/config";

export default function ConnectButton() {
  return (
    <ThirdWebButton
      client={config.thirdweb.client}
      chain={config.thirdweb.chain}
      appMetadata={config.thirdweb.appMetadata}
      accountAbstraction={config.thirdweb.accountAbstraction}
      connectButton={{
        label: "Connect Wallet",
        style: {
          backgroundColor: "transparent",
          fontFamily: "var(--font-chicago)",
          height: 40,
          fontSize: 12,
          lineHeight: 16,
        },
      }}
    />
  );
}
