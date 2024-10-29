"use client";
import { ConnectButton as ThirdWebButton } from "thirdweb/react";
import appConfig from "@/config";
import { arbitrum } from "thirdweb/chains";

export default function ConnectButton() {
  return (
    <ThirdWebButton
      client={appConfig.thirdweb.client}
      chain={arbitrum}
      appMetadata={appConfig.thirdweb.metadata}
      wallets={appConfig.thirdweb.wallets}
      theme={appConfig.thirdweb.theme}
      detailsButton={appConfig.thirdweb.detailsButton}
      connectButton={appConfig.thirdweb.connectButton}
      connectModal={appConfig.thirdweb.connectModal}
      switchButton={appConfig.thirdweb.switchButton}
    />
  );
}
